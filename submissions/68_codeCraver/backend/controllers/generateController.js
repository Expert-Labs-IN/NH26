import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseJSON = (text) => {
    try {
        return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
        return null;
    }
};

const buildPrompt = (specs, { tone, style, brandVoice, language } = {}) => {
  const toneLine = tone ? `\nTONE: Write in a ${tone} tone.` : '';
  const styleLine = style ? `\nSTYLE: Use a ${style} writing style.` : '';
  const brandLine = brandVoice ? `\nBRAND VOICE: Adopt this brand personality — ${brandVoice}. Let it influence word choice, sentence rhythm, and overall feel across all outputs.` : '';
  const langLine = language && language !== 'English' ? `\nLANGUAGE: Write ALL output content in ${language}. The JSON keys must remain in English, but all values (product name, descriptions, captions, posts, tags) must be written in ${language}.` : '';

  return `
You are an expert e-commerce copywriter and product marketing specialist.
Generate compelling, platform-optimized marketing copy for the following product.
${toneLine}${styleLine}${brandLine}${langLine}

PRODUCT SPECS:
${Object.entries(specs).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
{
  "productName": "a catchy commercial product name based on specs",
  "seoDescription": "150-200 word SEO-optimized product description for an online storefront. Include key features, benefits, and natural keyword placement.",
  "instagramCaption": "Punchy 2-3 sentence Instagram caption with emojis and 8-10 relevant hashtags. Trendy, aspirational tone.",
  "linkedinPost": "Professional 3-4 sentence LinkedIn post highlighting business value, quality, and use cases. End with a subtle CTA. No hashtag spam — max 3 professional tags.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
}

Tags should be specific, searchable keywords for the product database (category, material, use-case, etc).
`;
};

export const generateCopy = async (req, res) => {
    try {
        const specs = JSON.parse(req.body.specs || '{}');
        const tone = req.body.tone || '';
        const style = req.body.style || '';
        const brandVoice = req.body.brandVoice || '';
        const language = req.body.language || 'English';
        const hasImage = !!req.file;
        const promptOpts = { tone, style, brandVoice, language };

        let messages = [];

        if (hasImage) {
            const base64 = req.file.buffer.toString('base64');
            const mimeType = req.file.mimetype;
            messages.push({
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: `data:${mimeType};base64,${base64}` },
                    },
                    {
                        type: 'text',
                        text: buildPrompt(specs, promptOpts) + '\n\nAlso analyze the product image above and incorporate visual details (color, design, finish, form factor) into the copy.',
                    },
                ],
            });
        } else {
            messages.push({ role: 'user', content: buildPrompt(specs, promptOpts) });
        }

        const chatCompletion = await groq.chat.completions.create({
            model: hasImage ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
            max_tokens: 1500,
            temperature: 0.7,
            messages,
        });

        const text = chatCompletion.choices[0].message.content;
        const parsed = parseJSON(text);

        if (!parsed) {
            return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
        }

        if (hasImage) {
            parsed.imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }

        res.json(parsed);
    } catch (err) {
        console.error('Groq API error:', err.message);
        res.status(500).json({ error: 'Generation failed', details: err.message });
    }
};
