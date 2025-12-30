const mongoose = require('mongoose'); // This line was missing!

const moodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { 
    type: String, 
    required: true, 
    // This enum matches exactly what we send from the frontend
    enum: ['happy', 'sad', 'angry', 'neutral'] 
  },
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mood', moodSchema);