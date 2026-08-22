/**
 * AI Orchestrator for PulseHR using Google Gemini.
 *
 * Gemini never touches the database directly. It can only request one of
 * the typed tools below. The backend validates and executes those tools
 * against Prisma, scoped to the authenticated user.
 */

const { GoogleGenAI } = require("@google/genai");
const prisma = require("../config/prisma");

const MODEL = "gemini-2.5-flash";

function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

// ---------------------------------------------------------------------------
// Gemini function declarations
// ---------------------------------------------------------------------------

const tools = [
  {
    functionDeclarations: [
      {
        name: "apply_leave",
        description: "Submit a leave request on behalf of the current employee.",
        parametersJsonSchema: {
          type: "object",
          properties: {
            leaveType: {
              type: "string",
              enum: ["PAID", "SICK", "UNPAID"],
            },
            startDate: {
              type: "string",
              description: "ISO date, e.g. 2026-08-25",
            },
            endDate: {
              type: "string",
              description: "ISO date, e.g. 2026-08-27",
            },
            remarks: {
              type: "string",
            },
          },
          required: ["leaveType", "startDate", "endDate"],
        },
      },

      {
        name: "get_my_attendance",
        description:
          "Fetch the current employee's recent attendance records.",
        parametersJsonSchema: {
          type: "object",
          properties: {
            range: {
              type: "string",
              enum: ["daily", "weekly"],
            },
          },
        },
      },

      {
        name: "get_my_leave_balance_summary",
        description:
          "Summarize the current employee's leave history with approved, pending and rejected counts.",
        parametersJsonSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Execute tools against the real database
// ---------------------------------------------------------------------------

async function executeTool(name, input, userId) {
  switch (name) {
    case "apply_leave": {
      if (new Date(input.startDate) > new Date(input.endDate)) {
        return {
          error: "startDate must be before endDate.",
        };
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

      return {
        success: true,
        leaveId: leave.id,
        status: leave.status,
      };
    }

    case "get_my_attendance": {
      const days = input.range === "weekly" ? 7 : 1;

      const since = new Date();
      since.setDate(since.getDate() - days);

      const records = await prisma.attendance.findMany({
        where: {
          userId,
          date: {
            gte: since,
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      return {
        records,
      };
    }

    case "get_my_leave_balance_summary": {
      const all = await prisma.leaveRequest.findMany({
        where: {
          userId,
        },
      });

      return {
        approved: all.filter((l) => l.status === "APPROVED").length,
        pending: all.filter((l) => l.status === "PENDING").length,
        rejected: all.filter((l) => l.status === "REJECTED").length,
      };
    }

    default:
      return {
        error: `Unknown tool: ${name}`,
      };
  }
}

// ---------------------------------------------------------------------------
// Employee AI Copilot
// ---------------------------------------------------------------------------

async function chatWithCopilot({
  message,
  userId,
  history = [],
}) {
  const client = getClient();

  if (!client) {
    return {
      reply:
        "AI Copilot isn't configured yet — add GEMINI_API_KEY to backend/.env.",
    };
  }

  const contents = [];

  // Convert existing history into Gemini-compatible contents.
  for (const item of history) {
    if (!item || !item.role || !item.content) continue;

    let text = "";

    if (typeof item.content === "string") {
      text = item.content;
    } else if (Array.isArray(item.content)) {
      text = item.content
        .filter((part) => typeof part?.text === "string")
        .map((part) => part.text)
        .join("\n");
    }

    if (!text) continue;

    contents.push({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  const config = {
    systemInstruction:
      "You are PulseHR's employee assistant. " +
      "You can apply leave and check attendance ONLY for the currently " +
      "authenticated employee using the provided tools. " +
      "Be concise and confirm actions clearly. " +
      "Never invent attendance or leave information. " +
      "Always use the appropriate tool when the user asks about real " +
      "attendance or leave data.",
    tools,
  };

  let response = await client.models.generateContent({
    model: MODEL,
    contents,
    config,
  });

  // Gemini function-calling loop.
  for (let iteration = 0; iteration < 5; iteration++) {
    const functionCalls = response.functionCalls || [];

    if (functionCalls.length === 0) {
      return {
        reply:
          response.text ||
          "I couldn't generate a response. Please try again.",
      };
    }

    const functionResponses = [];

    for (const call of functionCalls) {
      const result = await executeTool(
        call.name,
        call.args || {},
        userId
      );

      functionResponses.push({
        functionResponse: {
          name: call.name,
          response: result,
        },
      });
    }

    contents.push({
      role: "model",
      parts: functionCalls.map((call) => ({
        functionCall: {
          name: call.name,
          args: call.args || {},
        },
      })),
    });

    contents.push({
      role: "user",
      parts: functionResponses,
    });

    response = await client.models.generateContent({
      model: MODEL,
      contents,
      config,
    });
  }

  return {
    reply: "The AI assistant took too long to complete the request.",
  };
}

// ---------------------------------------------------------------------------
// Admin AI Pulse Briefing
// ---------------------------------------------------------------------------

async function generatePulseBriefing() {
  const client = getClient();

  const [
    pendingLeaves,
    todayAbsences,
    totalEmployees,
  ] = await Promise.all([
    prisma.leaveRequest.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        date: {
          gte: new Date(
            new Date().setHours(0, 0, 0, 0)
          ),
        },
      },
    }),

    prisma.user.count({
      where: {
        role: "EMPLOYEE",
      },
    }),
  ]);

  const stats = {
    pendingLeaves,
    todayAbsences,
    totalEmployees,
  };

  if (!client) {
    return {
      briefing:
        `You have ${pendingLeaves} pending leave request(s) and ` +
        `${todayAbsences} absence(s) recorded today out of ` +
        `${totalEmployees} employees. ` +
        `(Add a GEMINI_API_KEY for AI-written summaries.)`,
      stats,
    };
  }

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `Write today's HR pulse briefing from this data: ` +
              `${JSON.stringify(stats)}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        "You write extremely concise 2-3 sentence daily HR briefings " +
        "for an admin dashboard. Use only the numeric facts provided. " +
        "Be direct and actionable. Never invent names or numbers.",
    },
  });

  return {
    briefing:
      response.text ||
      "No briefing could be generated.",
    stats,
  };
}

// ---------------------------------------------------------------------------
// Smart Approve
// ---------------------------------------------------------------------------

async function generateSmartApproveSuggestion({
  employeeName,
  leaveType,
  startDate,
  endDate,
  remarks,
  priorApprovedLeaves,
}) {
  const client = getClient();

  const facts = {
    employeeName,
    leaveType,
    startDate,
    endDate,
    remarks,
    priorApprovedLeaves,
  };

  if (!client) {
    return "AI recommendation unavailable — add GEMINI_API_KEY to enable Smart Approve.";
  }

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `Leave request facts: ${JSON.stringify(facts)}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction:
        "You are an HR decision-support assistant. " +
        "Given leave request facts, respond in this exact format: " +
        "'Suggest: Approve|Reject — <one sentence reasoning>'. " +
        "Be conservative. Recommend Reject only for clear policy concerns, " +
        "otherwise recommend Approve.",
    },
  });

  return (
    response.text ||
    "Suggest: Approve — no concerns found."
  );
}

module.exports = {
  chatWithCopilot,
  generatePulseBriefing,
  generateSmartApproveSuggestion,
};