const express = require("express");
const { z } = require("zod");
const prisma = require("../config/prisma");
const authGuard = require("../middleware/auth");
const roleGuard = require("../middleware/role");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(authGuard);

// Fields an employee is allowed to edit on their own profile.
const selfEditSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  profilePicUrl: z.string().url().optional(),
});

// Fields an admin can edit on anyone's profile.
const adminEditSchema = selfEditSchema.extend({
  fullName: z.string().min(2).optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
});

// GET /api/profile/me
router.get("/me", async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.user.id } });
  if (!profile) return res.status(404).json({ error: "Profile not found." });
  res.json(profile);
});

// PATCH /api/profile/me — employee can only touch limited fields
router.patch("/me", validate(selfEditSchema), async (req, res) => {
  const updated = await prisma.profile.update({
    where: { userId: req.user.id },
    data: req.body,
  });
  res.json(updated);
});

// GET /api/profile/:userId — admin only
router.get("/:userId", roleGuard("ADMIN"), async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.params.userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found." });
  res.json(profile);
});

// PATCH /api/profile/:userId — admin can edit everything
router.patch("/:userId", roleGuard("ADMIN"), validate(adminEditSchema), async (req, res) => {
  const updated = await prisma.profile.update({
    where: { userId: req.params.userId },
    data: req.body,
  });
  res.json(updated);
});

module.exports = router;
