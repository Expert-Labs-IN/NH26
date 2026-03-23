import Groq from 'groq-sdk';

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const buildEmailPrompt = (productData) => `Generate email marketing content for:

Product: ${productData.name}
Description: ${productData.description}
${productData.price ? `Price: ${productData.price}` : ''}
${productData.targetAudience ? `Target Audience: ${productData.targetAudience}` : ''}

Generate 3 email variations:
1. Welcome/Launch email (announcing the product)
2. Promotional/Sale email (driving urgency)
3. Follow-up/Nurture email (re-engagement)

Each must have: subject line, preview text, body (HTML-friendly text with paragraphs), and CTA button text.

Return ONLY valid JSON:
{
  "launch": {
    "subject": "...",
    "preview": "...",
    "body": "...",
    "cta": "..."
  },
  "promotional": {
    "subject": "...",
    "preview": "...",
    "body": "...",
    "cta": "..."
  },
  "followup": {
    "subject": "...",
    "preview": "...",
    "body": "...",
    "cta": "..."
  }
}`;

export const generateEmailCopy = async (productData, model) => {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an email marketing expert. Return ONLY valid JSON, no markdown.' },
      { role: 'user', content: buildEmailPrompt(productData) }
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });
  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse email copy response');
  return JSON.parse(jsonMatch[0]);
};
