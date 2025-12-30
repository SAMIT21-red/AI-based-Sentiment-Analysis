const express = require("express");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    // Note: Ensure your User model hashes this password in a pre-save hook!
    const user = new User({ username, email, password });
    await user.save();

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Login failed after registration" });
      res.json({ message: "Registered and logged in successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during registration" });
  }
});

// LOGIN
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Invalid login credentials" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ message: "Logged in", user: { username: user.username, email: user.email } });
    });
  })(req, res, next);
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    
    req.session.destroy((err) => {
      // Updated to "mindmate.sid" to match your server.js configuration
      res.clearCookie("mindmate.sid"); 
      res.json({ message: "Logged out successfully" });
    });
  });
});

// AUTH CHECK (Used by script.js to verify sessions)
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  
  // Return user info so script.js can display it in the Profile alert
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email
  });
});

module.exports = router;