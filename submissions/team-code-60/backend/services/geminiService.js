import { GoogleGenerativeAI } from '@google/generative-ai';

const getGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

const buildPrompt = (productData) => {
  const lang = productData.language || 'English';
  const tone = productData.tone || 'professional';
  const competitor = productData.competitor;

  return `Generate marketing content for this product in ${lang} language with a ${tone} tone:

Product: ${productData.name}
Description: ${productData.description}
${productData.color ? `Color: ${productData.color}` : ''}
${productData.material ? `Material: ${productData.material}` : ''}
${productData.weight ? `Weight: ${productData.weight}` : ''}
${productData.dimensions ? `Dimensions: ${productData.dimensions}` : ''}
${productData.price ? `Price: ${productData.price}` : ''}
${productData.targetAudience ? `Target Audience: ${productData.targetAudience}` : ''}
${productData.additionalInfo ? `Additional Info: ${productData.additionalInfo}` : ''}
${competitor ? `Competitor to beat: ${competitor}. Position our product as a superior alternative.` : ''}

ALL content MUST be written in ${lang}.
Use a ${tone} tone throughout.

Generate ALL of the following:
1. SEO-optimized web description (150-200 words, keyword-rich for e-commerce storefront)
2. Instagram caption (engaging, lifestyle tone, emojis, 5-8 hashtags)
3. LinkedIn post (professional, thought-leadership tone)
4. Twitter/X post (concise, under 280 characters, punchy, with 2-3 hashtags)
5. Facebook post (conversational, community-focused, with a clear CTA)
6. 10-15 dynamic SEO/category tags for product database search
7. A content quality score object with: readability (1-100), engagement (1-100), seoScore (1-100), overallScore (1-100)

Also generate 3 A/B variations of ALL content above: Emotional, Technical, Sales

Return ONLY valid JSON in this exact format:
{
  "seo": "...",
  "instagram": "...",
  "linkedin": "...",
  "twitter": "...",
  "facebook": "...",
  "tags": ["tag1", "tag2", "..."],
  "contentScore": { "readability": 85, "engagement": 90, "seoScore": 88, "overallScore": 87 },
  "variations": {
    "emotional": { "seo": "...", "instagram": "...", "linkedin": "...", "twitter": "...", "facebook": "...", "tags": ["..."] },
    "technical": { "seo": "...", "instagram": "...", "linkedin": "...", "twitter": "...", "facebook": "...", "tags": ["..."] },
    "sales": { "seo": "...", "instagram": "...", "linkedin": "...", "twitter": "...", "facebook": "...", "tags": ["..."] }
  }
}`;
};

export const generateWithGemini = async (productData) => {
  const genAI = getGemini();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(buildPrompt(productData));
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
};
