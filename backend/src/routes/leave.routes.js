const express = require("express");
const { z } = require("zod");
const prisma = require("../config/prisma");
const authGuard = require("../middleware/auth");
const roleGuard = require("../middleware/role");
const validate = require("../middleware/validate");
const { generateSmartApproveSuggestion } = require("../services/ai.service");

const router = express.Router();
router.use(authGuard);

const applySchema = z.object({
  leaveType: z.enum(["PAID", "SICK", "UNPAID"]),
  startDate: z.string(), // ISO date string
  endDate: z.string(),
  remarks: z.string().optional(),
});

const decisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  adminComment: z.string().optional(),
});

// POST /api/leave/apply
router.post("/apply", validate(applySchema), async (req, res) => {
  const { leaveType, startDate, endDate, remarks } = req.body;

  if (new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ error: "startDate must be before endDate." });
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      userId: req.user.id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      remarks,
    },
  });

  res.status(201).json(leave);
});

// GET /api/leave/me
router.get("/me", async (req, res) => {
  const leaves = await prisma.leaveRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(leaves);
});

// GET /api/leave/all — admin
router.get("/all", roleGuard("ADMIN"), async (req, res) => {
  const leaves = await prisma.leaveRequest.findMany({
    include: { user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(leaves);
});

// GET /api/leave/:id/suggest — admin: fetch (and cache) the AI recommendation
router.get("/:id/suggest", roleGuard("ADMIN"), async (req, res) => {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: req.params.id },
    include: { user: { include: { profile: true } } },
  });
  if (!leave) return res.status(404).json({ error: "Leave request not found." });

  if (leave.aiSuggestion) return res.json({ suggestion: leave.aiSuggestion });

  const pastLeaves = await prisma.leaveRequest.count({
    where: { userId: leave.userId, status: "APPROVED" },
  });

  const suggestion = await generateSmartApproveSuggestion({
    employeeName: leave.user.profile?.fullName || leave.user.email,
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    remarks: leave.remarks,
    priorApprovedLeaves: pastLeaves,
  });

  await prisma.leaveRequest.update({ where: { id: leave.id }, data: { aiSuggestion: suggestion } });

  res.json({ suggestion });
});

// PATCH /api/leave/:id/decision — admin approve/reject
router.patch("/:id/decision", roleGuard("ADMIN"), validate(decisionSchema), async (req, res) => {
  const { decision, adminComment } = req.body;

  const leave = await prisma.leaveRequest.update({
    where: { id: req.params.id },
    data: { status: decision, adminComment },
  });

  res.json(leave);
});

module.exports = router;
