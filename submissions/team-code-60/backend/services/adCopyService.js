import Groq from 'groq-sdk';

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const buildAdPrompt = (productData) => `Generate ad copy for these platforms for the following product:

Product: ${productData.name}
Description: ${productData.description}
${productData.price ? `Price: ${productData.price}` : ''}
${productData.targetAudience ? `Target Audience: ${productData.targetAudience}` : ''}

Generate ad copy for:
1. Google Search Ad (3 headlines max 30 chars each, 2 descriptions max 90 chars each)
2. Facebook/Instagram Ad (headline, primary text, description, CTA)
3. LinkedIn Sponsored Ad (intro text, headline, description)

Return ONLY valid JSON:
{
  "google": {
    "headlines": ["...", "...", "..."],
    "descriptions": ["...", "..."]
  },
  "facebook": {
    "headline": "...",
    "primaryText": "...",
    "description": "...",
    "cta": "..."
  },
  "linkedin": {
    "introText": "...",
    "headline": "...",
    "description": "..."
  }
}`;

export const generateAdCopy = async (productData, model) => {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a performance marketing expert. Return ONLY valid JSON, no markdown.' },
      { role: 'user', content: buildAdPrompt(productData) }
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });
  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse ad copy response');
  return JSON.parse(jsonMatch[0]);
};
