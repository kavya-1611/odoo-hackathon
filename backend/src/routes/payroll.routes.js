const express = require("express");
const { z } = require("zod");
const prisma = require("../config/prisma");
const authGuard = require("../middleware/auth");
const roleGuard = require("../middleware/role");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(authGuard);

const updateSchema = z.object({
  basicSalary: z.number().nonnegative(),
  allowances: z.number().nonnegative().default(0),
  deductions: z.number().nonnegative().default(0),
});

// GET /api/payroll/me — read-only for the employee
router.get("/me", async (req, res) => {
  const payroll = await prisma.payroll.findUnique({ where: { userId: req.user.id } });
  if (!payroll) return res.status(404).json({ error: "Payroll record not found." });
  res.json(payroll);
});

// GET /api/payroll/:userId — admin
router.get("/:userId", roleGuard("ADMIN"), async (req, res) => {
  const payroll = await prisma.payroll.findUnique({ where: { userId: req.params.userId } });
  if (!payroll) return res.status(404).json({ error: "Payroll record not found." });
  res.json(payroll);
});

// PATCH /api/payroll/:userId — admin only
router.patch("/:userId", roleGuard("ADMIN"), validate(updateSchema), async (req, res) => {
  const { basicSalary, allowances, deductions } = req.body;
  const netPay = basicSalary + allowances - deductions;

  const payroll = await prisma.payroll.update({
    where: { userId: req.params.userId },
    data: { basicSalary, allowances, deductions, netPay },
  });

  res.json(payroll);
});

module.exports = router;
