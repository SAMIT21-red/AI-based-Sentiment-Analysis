require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

// 1. Import all routes at the top
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const moodRoutes = require("./routes/mood"); 

const app = express();

// ===== CORS =====
app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));

app.use(express.json());

// ===== SESSION =====
app.use(session({
  name: "mindmate.sid",
  secret: process.env.SESSION_SECRET || "mindmate_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax"
  }
}));

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// ===== ROUTES =====
// Ensure these match the variables imported at the top
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/mood", moodRoutes); 

// ===== MONGODB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ===== START SERVER =====
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});