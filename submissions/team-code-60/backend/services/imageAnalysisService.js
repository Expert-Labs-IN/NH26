import { GoogleGenerativeAI } from '@google/generative-ai';

export const analyzeProductImage = async (imageBuffer, mimeType) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Required for image analysis.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType || 'image/jpeg',
    },
  };

  const prompt = `Analyze this product image carefully and extract all possible product details.

Return ONLY valid JSON in this exact format:
{
  "name": "Full product name including brand if visible",
  "description": "Detailed 2-3 sentence description of the product, its features, and what it does",
  "color": "Product color(s)",
  "material": "Material if identifiable (e.g., plastic, metal, leather, fabric)",
  "weight": "Estimated weight if possible, or empty string",
  "dimensions": "Estimated dimensions if possible, or empty string",
  "price": "Price if visible on packaging, or empty string",
  "targetAudience": "Best guess target audience based on the product",
  "additionalInfo": "Any other details visible — brand logo, certifications, key features, model number, text on packaging",
  "category": "Product category (e.g., Electronics, Fashion, Food, Beauty, Sports)"
}

Be as detailed and accurate as possible. If you can see text, brand names, or labels in the image, include them.`;

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse image analysis');
  return JSON.parse(jsonMatch[0]);
};
