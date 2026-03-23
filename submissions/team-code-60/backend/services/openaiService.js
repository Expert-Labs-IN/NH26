import OpenAI from 'openai';

const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const buildPrompt = (productData) => `Generate marketing content for this product:

Product: ${productData.name}
Description: ${productData.description}
${productData.color ? `Color: ${productData.color}` : ''}
${productData.material ? `Material: ${productData.material}` : ''}
${productData.weight ? `Weight: ${productData.weight}` : ''}
${productData.dimensions ? `Dimensions: ${productData.dimensions}` : ''}
${productData.price ? `Price: ${productData.price}` : ''}
${productData.targetAudience ? `Target Audience: ${productData.targetAudience}` : ''}
${productData.additionalInfo ? `Additional Info: ${productData.additionalInfo}` : ''}

Generate ALL of the following:
1. SEO-optimized web description (150-200 words, keyword-rich for e-commerce storefront)
2. Instagram caption (engaging, lifestyle tone, emojis, 5-8 hashtags)
3. LinkedIn post (professional, thought-leadership tone)
4. Twitter/X post (concise, under 280 characters, punchy, with 2-3 hashtags)
5. Facebook post (conversational, community-focused, with a clear CTA)
6. 10-15 dynamic SEO/category tags for product database search

Also generate 3 A/B variations of ALL content above: Emotional, Technical, Sales

Return ONLY valid JSON in this exact format:
{
  "seo": "...",
  "instagram": "...",
  "linkedin": "...",
  "twitter": "...",
  "facebook": "...",
  "tags": ["tag1", "tag2", "..."],
  "variations": {
    "emotional": { "seo": "...", "instagram": "...", "linkedin": "...", "twitter": "...", "facebook": "...", "tags": ["..."] },
    "technical": { "seo": "...", "instagram": "...", "linkedin": "...", "twitter": "...", "facebook": "...", "tags": ["..."] },
    "sales": { "seo": "...", "instagram": "...", "linkedin": "...", "twitter": "...", "facebook": "...", "tags": ["..."] }
  }
}`;

export const generateWithOpenAI = async (productData) => {
  const openai = getOpenAI();
  const model = 'gpt-3.5-turbo';
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: 'You are a marketing expert.' },
      { role: 'user', content: buildPrompt(productData) }
    ],
    temperature: 0.7
  });
  return JSON.parse(response.choices[0].message.content);
};
