console.log("FILE EXECUTED");

const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/mindmate")
  .then(() => console.log("✅ MongoDB connected (TEST SERVER)"))
  .catch(err => console.error("❌ MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("TEST SERVER RUNNING");
});

app.listen(4000, () => {
  console.log("🚀 Test server running on http://localhost:4000");
});

