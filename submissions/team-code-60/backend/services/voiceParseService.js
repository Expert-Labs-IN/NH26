import { GoogleGenerativeAI } from '@google/generative-ai';

export const parseVoiceTranscript = async (transcript) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `A user described their product verbally. Extract structured product details from this transcript.

Transcript: "${transcript}"

Return ONLY valid JSON in this exact format:
{
  "name": "Product name if mentioned, or best guess",
  "description": "A clean 2-3 sentence product description based on what they said",
  "color": "Color if mentioned, or empty string",
  "material": "Material if mentioned, or empty string",
  "weight": "Weight if mentioned, or empty string",
  "dimensions": "Dimensions if mentioned, or empty string",
  "price": "Price if mentioned, or empty string",
  "targetAudience": "Target audience if mentioned or inferred, or empty string",
  "additionalInfo": "Any other details mentioned — brand, features, certifications, USPs"
}

Be smart about extracting info. If they say "it's a red leather bag for women that costs 50 dollars", extract color=red, material=leather, targetAudience=women, price=$50. Fill in as much as possible.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse voice transcript');
  return JSON.parse(jsonMatch[0]);
};
