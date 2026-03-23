import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const systemInstruction = "Analyze this email. Respond in JSON.";
const userMessage = "Test message";

async function test() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage }
      ]
    });
    console.log("SUCCESS:", JSON.stringify(response.choices[0].message.content));
    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err);
    process.exit(1);
  }
}

test();
