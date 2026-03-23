import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are CopyForge AI Assistant — a helpful, friendly e-commerce and marketing expert built into the CopyForge product catalog platform.

Your capabilities:
- Help users write better product descriptions, taglines, and marketing copy
- Advise on SEO best practices for product listings
- Suggest tone, style, and brand voice strategies
- Answer questions about e-commerce copywriting, social media marketing, and product positioning
- Help brainstorm product names, hashtags, and campaign ideas

Guidelines:
- Be concise and actionable — keep answers short unless the user asks for detail
- Use a warm, professional tone with occasional emojis
- If asked about something outside marketing/e-commerce, politely redirect
- Format responses with markdown when helpful (bold, lists, etc.)`;

export const chatWithAssistant = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required.' });
        }

        const chatCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 1000,
            temperature: 0.7,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages.map(m => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
        });

        const reply = chatCompletion.choices[0].message.content;
        res.json({ reply });
    } catch (err) {
        console.error('Chat API error:', err?.error || err.message || err);
        const detail = err?.error?.message || err?.message || 'Unknown error';
        res.status(500).json({ error: 'Chat failed', details: detail });
    }
};
