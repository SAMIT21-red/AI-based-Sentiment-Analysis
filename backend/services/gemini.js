/**
 * MindMate Intelligence Engine (Offline / No API)
 * -----------------------------------------------
 * Stable, context-aware chatbot for demos & deadlines
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function getGeminiResponse(message) {
  const input = message.toLowerCase();

  // =========================
  // 🚨 CRISIS / SAFETY FIRST
  // =========================
  if (/suicide|kill myself|end my life|hurt myself|self harm/i.test(input)) {
    return "[SAD] I’m really concerned about you. You matter deeply. Please talk to someone you trust or a professional right now. 💙";
  }

  // =========================
  // 😟 ANXIETY + EXAM FAILURE (NEW)
  // =========================
  if (
    /anxious|anxiety|panic|worried|fear/i.test(input) &&
    /exam|test|fail|failure|marks|result/i.test(input)
  ) {
    return pick([
      "[SAD] Fear of failing an exam can feel overwhelming. Remember—one exam does not define your intelligence or your future. What part worries you the most?",
      "[NEUTRAL] That fear sounds really heavy. Let’s break it down together—what subject or topic is causing the most stress?",
      "[NEUTRAL] Many people feel this pressure before exams. You’re not weak for feeling this way. Want help creating a small study plan?",
    ]);
  }

  // =========================
  // 😟 GENERAL ANXIETY
  // =========================
  if (/anxious|anxiety|panic|nervous|worried|fear/i.test(input)) {
    return pick([
      "[SAD] Anxiety can feel heavy. Let’s slow things down together. What triggered this feeling?",
      "[NEUTRAL] I hear your worry. Try taking one slow breath with me—what’s making you anxious right now?",
      "[NEUTRAL] It sounds like a lot is happening at once. Do you want to talk about one thing at a time?",
    ]);
  }

  // =========================
  // 😔 SADNESS + FUTURE FEAR (NEW)
  // =========================
  if (
    /sad|depressed|down|unhappy/i.test(input) &&
    /future|fail|never|always|nothing will work/i.test(input)
  ) {
    return pick([
      "[SAD] When the future feels uncertain, it can make everything heavier. You don’t have to figure everything out today.",
      "[NEUTRAL] It sounds like you’re feeling stuck and worried about what’s ahead. What’s the biggest fear right now?",
    ]);
  }

  // =========================
  // 😔 GENERAL SADNESS
  // =========================
  if (/sad|depressed|cry|unhappy|down|lonely/i.test(input)) {
    return pick([
      "[SAD] I’m really sorry you’re feeling this way. You don’t have to go through it alone.",
      "[NEUTRAL] Thank you for opening up. Do you want to tell me what’s been weighing on you?",
    ]);
  }

  // =========================
  // 📚 EXAMS / STUDY STRESS
  // =========================
  if (/exam|test|study|college|school|marks/i.test(input)) {
    return pick([
      "[NEUTRAL] Exam pressure is common, but it doesn’t define you. Would you like help planning your revision?",
      "[SAD] That stress sounds exhausting. Are you giving yourself short breaks while studying?",
    ]);
  }

  // =========================
  // 👋 GREETINGS
  // =========================
  if (/hi|hello|hey|good morning|good evening/i.test(input)) {
    return pick([
      "[NEUTRAL] Hello! I’m MindMate. How are you feeling today?",
      "[NEUTRAL] Hi there. I’m here to listen—what’s on your mind?",
    ]);
  }

  // =========================
  // 😊 POSITIVE EMOTIONS
  // =========================
  if (/happy|good|great|awesome|excited|relieved/i.test(input)) {
    return pick([
      "[HAPPY] That’s great to hear! What’s been going well for you?",
      "[HAPPY] I love hearing that 😊 Want to share more?",
    ]);
  }

  // =========================
  // 🙏 THANK YOU / GOODBYE
  // =========================
  if (/thank you|thanks|bye|goodbye/i.test(input)) {
    return pick([
      "[HAPPY] You’re welcome! I’m always here if you need to talk.",
      "[NEUTRAL] Take care of yourself. Reach out anytime.",
    ]);
  }

  // =========================
  // 🧠 DEFAULT REFLECTIVE RESPONSE
  // =========================
  return pick([
    "[NEUTRAL] I’m listening. Can you tell me more?",
    "[NEUTRAL] That sounds important. How long have you felt this way?",
    "[NEUTRAL] I see. What’s the hardest part for you right now?",
  ]);
}

module.exports = { getGeminiResponse };
