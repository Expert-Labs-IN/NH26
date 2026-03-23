import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

console.log("Starting model check...");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
groq.models.list().then(res => {
  console.log("MODELS:", res.data.map(m => m.id).join(', '));
}).catch(err => {
  console.error("ERROR:", err.message);
  if (err.response) console.error("BODY:", JSON.stringify(err.response.data));
});
