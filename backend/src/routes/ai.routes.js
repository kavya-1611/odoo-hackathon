const express = require("express");
const { z } = require("zod");
const authGuard = require("../middleware/auth");
const roleGuard = require("../middleware/role");
const validate = require("../middleware/validate");
const { chatWithCopilot, generatePulseBriefing } = require("../services/ai.service");

const router = express.Router();
router.use(authGuard);

const chatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.any()).optional(),
});

// POST /api/ai/chat — employee-facing conversational copilot
router.post("/chat", validate(chatSchema), async (req, res) => {
  try {
    const result = await chatWithCopilot({
      message: req.body.message,
      userId: req.user.id,
      history: req.body.history || [],
    });
    res.json(result);
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "The AI copilot ran into an issue. Please try again." });
  }
});

// GET /api/ai/pulse-briefing — admin-only daily summary
router.get("/pulse-briefing", roleGuard("ADMIN"), async (req, res) => {
  try {
    const result = await generatePulseBriefing();
    res.json(result);
  } catch (err) {
    console.error("AI briefing error:", err);
    res.status(500).json({ error: "Could not generate the pulse briefing right now." });
  }
});

module.exports = router;
