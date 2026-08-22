const express = require("express");
const prisma = require("../config/prisma");
const authGuard = require("../middleware/auth");
const roleGuard = require("../middleware/role");

const router = express.Router();
router.use(authGuard);

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// POST /api/attendance/check-in
router.post("/check-in", async (req, res) => {
  const today = startOfDay(new Date());

  const existing = await prisma.attendance.findFirst({
    where: { userId: req.user.id, date: today },
  });
  if (existing?.checkIn) {
    return res.status(409).json({ error: "Already checked in today." });
  }

  const record = existing
    ? await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkIn: new Date(), status: "PRESENT" },
      })
    : await prisma.attendance.create({
        data: { userId: req.user.id, date: today, checkIn: new Date(), status: "PRESENT" },
      });

  res.json(record);
});

// POST /api/attendance/check-out
router.post("/check-out", async (req, res) => {
  const today = startOfDay(new Date());

  const existing = await prisma.attendance.findFirst({
    where: { userId: req.user.id, date: today },
  });
  if (!existing || !existing.checkIn) {
    return res.status(400).json({ error: "You must check in before checking out." });
  }

  const record = await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: new Date() },
  });

  res.json(record);
});

// GET /api/attendance/me?range=weekly|daily
router.get("/me", async (req, res) => {
  const days = req.query.range === "weekly" ? 7 : 1;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.attendance.findMany({
    where: { userId: req.user.id, date: { gte: startOfDay(since) } },
    orderBy: { date: "desc" },
  });

  res.json(records);
});

// GET /api/attendance/all — admin: everyone's attendance
router.get("/all", roleGuard("ADMIN"), async (req, res) => {
  const records = await prisma.attendance.findMany({
    include: { user: { include: { profile: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });
  res.json(records);
});

// GET /api/attendance/:userId — admin: one employee's attendance
router.get("/:userId", roleGuard("ADMIN"), async (req, res) => {
  const records = await prisma.attendance.findMany({
    where: { userId: req.params.userId },
    orderBy: { date: "desc" },
  });
  res.json(records);
});

module.exports = router;
