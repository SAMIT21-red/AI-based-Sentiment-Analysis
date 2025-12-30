const express = require("express");
const ensureAuthenticated = require("../middleware/authMiddleware");
const Mood = require("../models/Mood");

const router = express.Router();

// --------------------
// GET MOOD SUMMARY
// --------------------
router.get("/summary", ensureAuthenticated, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user._id });

    const summary = {
      happy: 0,
      sad: 0,
      angry: 0,
      neutral: 0
    };

    moods.forEach(m => {
      summary[m.mood]++;
    });

    res.json(summary);
  } catch (err) {
    console.error("Mood summary error:", err);
    res.status(500).json({ error: "Failed to load mood summary" });
  }
});

// --------------------
// GET RECENT MOODS
// --------------------
router.get("/recent", ensureAuthenticated, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    res.json(moods);
  } catch (err) {
    console.error("Recent mood error:", err);
    res.status(500).json([]);
  }
});

module.exports = router;
