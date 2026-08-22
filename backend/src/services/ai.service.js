/**
 * AI Orchestrator for PulseHR.
 *
 * Design principle: Claude never touches the database directly. It can only
 * request one of the typed "tools" defined below; this backend validates the
 * request, executes the actual Prisma query/mutation, and returns the result
 * to Claude to summarize back to the user. This keeps every AI-driven action
 * auditable, permission-scoped, and safe from hallucinated writes.
 */

const Anthropic = require("@anthropic-ai/sdk");
const prisma = require("../config/prisma");

const MODEL = "claude-sonnet-4-6";

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ---------------------------------------------------------------------------
// Tool definitions exposed to Claude for the employee-facing Copilot chat.
// ---------------------------------------------------------------------------
const tools = [
  {
    name: "apply_leave",
    description: "Submit a leave request on behalf of the current employee.",
    input_schema: {
      type: "object",
      properties: {
        leaveType: { type: "string", enum: ["PAID", "SICK", "UNPAID"] },
        startDate: { type: "string", description: "ISO date, e.g. 2026-08-25" },
        endDate: { type: "string", description: "ISO date, e.g. 2026-08-27" },
        remarks: { type: "string" },
      },
      required: ["leaveType", "startDate", "endDate"],
    },
  },
  {
    name: "get_my_attendance",
    description: "Fetch the current employee's recent attendance records.",
    input_schema: {
      type: "object",
      properties: {
        range: { type: "string", enum: ["daily", "weekly"] },
      },
      required: [],
    },
  },
  {
    name: "get_my_leave_balance_summary",
    description: "Summarize the current employee's leave history (approved/pending/rejected counts).",
    input_schema: { type: "object", properties: {} },
  },
];

// Executes a tool call against the real database, scoped to the requesting user.
async function executeTool(name, input, userId) {
  switch (name) {
    case "apply_leave": {
      if (new Date(input.startDate) > new Date(input.endDate)) {
        return { error: "startDate must be before endDate." };
      }
      const leave = await prisma.leaveRequest.create({
        data: {
          userId,
          leaveType: input.leaveType,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          remarks: input.remarks || null,
        },
      });
      return { success: true, leaveId: leave.id, status: leave.status };
    }

    case "get_my_attendance": {
      const days = input.range === "weekly" ? 7 : 1;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const records = await prisma.attendance.findMany({
        where: { userId, date: { gte: since } },
        orderBy: { date: "desc" },
      });
      return { records };
    }

    case "get_my_leave_balance_summary": {
      const all = await prisma.leaveRequest.findMany({ where: { userId } });
      const summary = {
        approved: all.filter((l) => l.status === "APPROVED").length,
        pending: all.filter((l) => l.status === "PENDING").length,
        rejected: all.filter((l) => l.status === "REJECTED").length,
      };
      return summary;
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/**
 * Runs a single-turn agentic loop: send the user's message + tool
 * definitions to Claude, execute any tool calls it requests, feed the
 * results back, and return Claude's final natural-language reply.
 */
async function chatWithCopilot({ message, userId, history = [] }) {
  const client = getClient();
  if (!client) {
    return {
      reply:
        "AI Copilot isn't configured yet — add an ANTHROPIC_API_KEY to backend/.env to enable natural-language actions.",
    };
  }

  const messages = [...history, { role: "user", content: message }];

  let response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "You are PulseHR's employee assistant. You can apply leave and check attendance ONLY for the " +
      "currently authenticated employee via the provided tools. Be concise and confirm actions clearly. " +
      "Never invent data — always use a tool to look up real information before answering questions about " +
      "attendance or leave.",
    tools,
    messages,
  });

  // Agentic loop: keep executing tools until Claude returns a plain text answer.
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];

    for (const block of toolUseBlocks) {
      const result = await executeTool(block.name, block.input, userId);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        "You are PulseHR's employee assistant. Summarize tool results clearly and confirm any action taken.",
      tools,
      messages,
    });
  }

  const finalText = response.content.find((b) => b.type === "text")?.text || "Done.";
  return { reply: finalText, messages };
}

/**
 * Generates the admin's daily AI Pulse Briefing: a short natural-language
 * summary of attendance state, pending approvals, and anything that needs
 * attention today — computed from real aggregated data, not invented.
 */
async function generatePulseBriefing() {
  const client = getClient();

  const [pendingLeaves, todayAbsences, totalEmployees] = await Promise.all([
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.attendance.count({
      where: { status: "ABSENT", date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
  ]);

  const stats = { pendingLeaves, todayAbsences, totalEmployees };

  if (!client) {
    return {
      briefing: `You have ${pendingLeaves} pending leave request(s) and ${todayAbsences} absence(s) recorded today out of ${totalEmployees} employees. (Add an ANTHROPIC_API_KEY for AI-written summaries.)`,
      stats,
    };
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system:
      "You write extremely concise (2-3 sentence) daily HR briefings for an admin dashboard, based only " +
      "on the numeric facts given. Be direct and actionable. Never invent names or numbers not provided.",
    messages: [
      {
        role: "user",
        content: `Write today's HR pulse briefing from this data: ${JSON.stringify(stats)}`,
      },
    ],
  });

  const briefing = response.content.find((b) => b.type === "text")?.text || "";
  return { briefing, stats };
}

/**
 * Generates an explainable AI recommendation (approve/reject + reasoning)
 * for a pending leave request, based on real leave-history data.
 */
async function generateSmartApproveSuggestion({
  employeeName,
  leaveType,
  startDate,
  endDate,
  remarks,
  priorApprovedLeaves,
}) {
  const client = getClient();
  const facts = { employeeName, leaveType, startDate, endDate, remarks, priorApprovedLeaves };

  if (!client) {
    return "AI recommendation unavailable — add an ANTHROPIC_API_KEY to enable Smart Approve.";
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    system:
      "You are an HR decision-support assistant. Given leave request facts, respond with a short " +
      "recommendation in the format: 'Suggest: Approve|Reject — <one sentence reasoning>'. Be conservative: " +
      "recommend Reject only for clear policy concerns (e.g. excessive unpaid leave frequency), otherwise Approve.",
    messages: [{ role: "user", content: `Leave request facts: ${JSON.stringify(facts)}` }],
  });

  return response.content.find((b) => b.type === "text")?.text || "Suggest: Approve — no concerns found.";
}

module.exports = {
  chatWithCopilot,
  generatePulseBriefing,
  generateSmartApproveSuggestion,
};
