const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../config/prisma");
const validate = require("../middleware/validate");
const authGuard = require("../middleware/auth");
const { signToken } = require("../utils/jwt");

const router = express.Router();

const signupSchema = z.object({
  employeeId: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain an uppercase letter.")
    .regex(/[0-9]/, "Password must contain a number."),
  fullName: z.string().min(2),
  role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/signup
router.post("/signup", validate(signupSchema), async (req, res) => {
  const { employeeId, email, password, fullName, role } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { employeeId }] },
  });
  if (existing) {
    return res.status(409).json({ error: "An account with this email or employee ID already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      employeeId,
      email,
      passwordHash,
      role,
      profile: { create: { fullName } },
      payroll: { create: { basicSalary: 0, netPay: 0 } },
    },
    include: { profile: true },
  });

  // NOTE: In production, send a real verification email here (e.g. via Resend)
  // and set isVerified: false until the link is clicked. Simplified for demo.

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  res.status(201).json({
    token,
    user: { id: user.id, employeeId: user.employeeId, email: user.email, role: user.role, fullName },
  });
});

// POST /api/auth/login
router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });

  res.json({
    token,
    user: {
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role,
      fullName: user.profile?.fullName || "",
    },
  });
});

// GET /api/auth/me
router.get("/me", authGuard, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true },
  });
  if (!user) return res.status(404).json({ error: "User not found." });

  res.json({
    id: user.id,
    employeeId: user.employeeId,
    email: user.email,
    role: user.role,
    fullName: user.profile?.fullName || "",
  });
});

module.exports = router;
