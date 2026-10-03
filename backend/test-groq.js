require('dotenv').config();
const { generateGroqResponse } = require('./src/services/aiService');

(async () => {
  try {
    console.log("Starting test...");
    const reply = await generateGroqResponse("System Prompt", "User Message");
    console.log("Reply:", reply);
  } catch (err) {
    console.error("Caught error:", err);
  }
})();
