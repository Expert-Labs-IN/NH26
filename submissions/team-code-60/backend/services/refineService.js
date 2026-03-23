import Groq from 'groq-sdk';

const getGroq = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export const refineContent = async (originalContent, platform, instruction) => {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a marketing copywriter. The user will give you existing marketing content for a specific platform and an instruction to modify it. Return ONLY the refined content text, nothing else. No quotes, no explanation, just the improved content.'
      },
      {
        role: 'user',
        content: `Platform: ${platform}\n\nOriginal content:\n${originalContent}\n\nInstruction: ${instruction}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  return response.choices[0].message.content.trim();
};

export const generatePersonas = async (productData) => {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a marketing strategist. Return ONLY valid JSON, no markdown or extra text.'
      },
      {
        role: 'user',
        content: `Based on this product, generate 3 distinct target audience personas:

Product: ${productData.name}
Description: ${productData.description}
${productData.targetAudience ? `Target Audience Hint: ${productData.targetAudience}` : ''}
${productData.price ? `Price: ${productData.price}` : ''}

For each persona, provide:
- name (a realistic first name)
- age (specific number)
- occupation
- location (city, country)
- income (range)
- painPoints (array of 3 short pain points)
- goals (array of 2 short goals)
- preferredChannels (array of 2-3 from: Instagram, LinkedIn, Twitter, Facebook, Email, Google)
- buyingMotivation (1 short sentence)
- emoji (1 emoji that represents this persona)

Return ONLY valid JSON:
{
  "personas": [
    { "name": "...", "age": 28, "occupation": "...", "location": "...", "income": "...", "painPoints": ["..."], "goals": ["..."], "preferredChannels": ["..."], "buyingMotivation": "...", "emoji": "..." },
    { ... },
    { ... }
  ]
}`
      }
    ],
    temperature: 0.8,
    max_tokens: 1500,
  });
  const text = response.choices[0].message.content;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse personas');
  return JSON.parse(jsonMatch[0]);
};
