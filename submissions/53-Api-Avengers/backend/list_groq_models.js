import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.models.list();
    console.log("MODELS:", JSON.stringify(response.data.map(m => m.id)));
    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err);
    process.exit(1);
  }
}

listModels();
