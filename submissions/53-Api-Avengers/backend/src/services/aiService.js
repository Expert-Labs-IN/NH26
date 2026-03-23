import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const triageSchema = z.object({
  summary: z.array(z.string()).max(3).min(1),
  priority: z.enum(['Urgent', 'Action Required', 'FYI']),
  suggestedAction: z.object({
    type: z.enum(['reply', 'calendar', 'task']),
    payload: z.record(z.any())
  }),
  reasoning: z.string()
});

export const processEmailTriage = async (emailData) => {
  // Uses GEMINI_API_KEY from environment automatically
  const ai = new GoogleGenAI({});
  
  const systemInstruction = `
You are an Email Triage Agent. Analyze the provided email.
1. Summarize in up to 3 bullets.
2. Classify priority (Urgent, Action Required, FYI).
3. If it's a meeting request, return a 'calendar' object payload. If it's a question or requires a response, return a 'reply' draft payload. If its a project task, return a 'task' payload.
Output MUST be strictly valid JSON according to this structure:
{
  "summary": ["bullet 1", "bullet 2", "bullet 3"],
  "priority": "Urgent" | "Action Required" | "FYI",
  "suggestedAction": {
    "type": "reply" | "calendar" | "task",
    "payload": {} // provide relevant details like text, date, taskName, etc.
  },
  "reasoning": "Explanation of why this action was chosen."
}
Return ONLY the raw JSON object, without markdown formatting.`;

  const userMessage = `
Sender: ${emailData.sender}
Subject: ${emailData.subject}
Body: ${emailData.body}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const outputText = response.text();
    let parsedJson;
    try {
      parsedJson = JSON.parse(outputText);
    } catch (e) {
      console.error("Failed to parse JSON directly. Output was:", outputText);
      throw new Error('AI response was not valid JSON');
    }
    
    // Validate the AI output using Zod
    const validatedData = triageSchema.parse(parsedJson);

    return validatedData;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw new Error('AI processing or validation failed');
  }
};
