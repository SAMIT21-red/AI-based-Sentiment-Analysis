const express = require("express");
const ensureAuthenticated = require("../middleware/authMiddleware");
const { getGeminiResponse } = require("../services/gemini");
const Mood = require("../models/Mood"); // ✅ ADD THIS

const router = express.Router();

/**
 * POST /api/chat/message
 * - Saves chat history
 * - Extracts mood
 * - Saves mood for mood.html
 */
router.post("/message", ensureAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.json({
        reply: "[NEUTRAL] Please type something so I can help you 🙂"
      });
    }

    // 1️⃣ Save USER message
    req.user.chatHistory.push({
      sender: "user",
      message: message.trim()
    });

    // 2️⃣ Get BOT reply
    const reply = await getGeminiResponse(message.trim());

    // 3️⃣ Save BOT message
    req.user.chatHistory.push({
      sender: "bot",
      message: reply
    });

    // 4️⃣ EXTRACT MOOD FROM REPLY
    let mood = "neutral";
    const match = reply.match(/\[(HAPPY|SAD|ANGRY|NEUTRAL)\]/);

    if (match) {
      mood = match[1].toLowerCase();
    }

    // 5️⃣ SAVE MOOD TO Mood COLLECTION ✅✅✅
    await Mood.create({
      user: req.user._id,
      mood,
      message: message.trim()
    });

    // 6️⃣ Save user document
    await req.user.save();

    // 7️⃣ Send response
    res.json({ reply });

  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({
      reply: "[NEUTRAL] I'm here with you. Something went wrong."
    });
  }
});


/**
 * GET /api/chat/history
 */
router.get("/history", ensureAuthenticated, async (req, res) => {
  res.json(req.user.chatHistory || []);
});

/**
 * DELETE /api/chat/history
 */
router.delete("/history", ensureAuthenticated, async (req, res) => {
  req.user.chatHistory = [];
  await req.user.save();
  res.json({ success: true });
});

module.exports = router;
