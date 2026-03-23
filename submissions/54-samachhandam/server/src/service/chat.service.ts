import { GoogleGenerativeAI } from "@google/generative-ai";

import chatModel from "@/models/chat/chat.model";
import complainModel from "@/models/complain/complain.model";
import OccupationService from "./occupation.service";

interface reply {}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});
export class ChatService {
  static async createChatSession(userId: string) {
    const uid = crypto.randomUUID();
    const chat = new chatModel({
      userId,
      sessionId: uid,
      messages: [],
    });
    await chat.save();
    return { chatId: chat._id, sessionId: uid };
  }
  static async buildPrompt(message: string, messageCount: number) {
    const occupation = await OccupationService.getAllOccupations();
    const categoryOptions = [
      {
        _id: 9,
        name: "Medical",
        description:
          "Health-related issues, emergencies, or medical assistance.",
      },
      {
        _id: 10,
        name: "Technical",
        description:
          "Problems with devices, software, hardware, or technical support.",
      },
      ...occupation,
    ];

    return `
You are an AI assistant for a Smart Complaint Management System.

Your goal:
1. Try to resolve the user's issue through conversation.
2. If needed, suggest escalation (doctor / technician / authority).
3. After a few interactions (3–5 messages), gently encourage complaint creation as a faster solution.
4. If the user directly asks to create a complaint, do it immediately.

You must ALWAYS return STRICT JSON ONLY in the following format:

{
  "isComplaint": true/false,
  "category": "${categoryOptions}",
  "priority": "low | medium | high",
  "description": "clean summary of complaint",
  "reply": "message to user",
  "title": "short title for complaint"
}

-------------------------------------

CONTEXT:
- message_count: ${messageCount}

-------------------------------------

LOGIC:

1. DEFAULT BEHAVIOR:
   - Act as a support agent
   - Ask ONE question or give ONE step at a time
   - Keep replies short and practical
   - "isComplaint": false

2. DIRECT COMPLAINT REQUEST:
   - If user says things like:
     "create complaint", "raise issue", "report this", "file complaint"
   - Immediately:
     - "isComplaint": true
     - Generate full complaint JSON

3. USER PROBLEM SOLVED:
   - "isComplaint": false
   - Reply with closure

4. FRUSTRATION DETECTION:
   - كلمات like: "not working", "again", "still same", "annoying", "fix this"
   - Respond empathetically
   - Suggest escalation
   - "isComplaint": false

5. EXPERT-REQUIRED CASE:
   - Medical / technical / infrastructure issues
   - Suggest escalation immediately
   - "isComplaint": false

6. SOFT CONVERSION (BUSINESS LOGIC):
   - If message_count >= 3:
     - Gently suggest complaint as faster resolution
     - Example tone:
       "If you'd like, I can quickly raise a complaint so the team can handle this for you."
     - DO NOT force
     - "isComplaint": false

7. USER AGREES TO ESCALATION:
   - Examples: "yes", "ok", "do it", "please proceed"
   - Now:
     - "isComplaint": true

8. USER REFUSES:
   - Continue chat or exit politely
   - "isComplaint": false

-------------------------------------

PRIORITY RULES:
- high → danger, health risk, urgent failure, strong frustration
- medium → normal issue
- low → minor inconvenience

-------------------------------------

CATEGORY:
- Must be EXACTLY one of:
${categoryOptions}
- and return the _id, description, and name of the category in the "category" field of the JSON response.

-------------------------------------

DESCRIPTION:
- Clean, structured summary
- No slang
- Include issue + impact

-------------------------------------

TITLE:
- Max 8 words
- Clear and specific

-------------------------------------

REPLY STYLE:
- Human-like
- Helpful, not pushy
- Slightly persuasive after multiple turns

-------------------------------------

STRICT RULES:
- ALWAYS return valid JSON
- No markdown
- No extra text
- No explanation outside JSON

-------------------------------------

User Message:
"""${message}"""
`;
  }

  static formatHistory(messages: any[]) {
    return messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));
  }

  static safeParseJSON(text: string) {
    if (!text) return null;

    const tryParse = (value: string) => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    };

    // 1) Try raw response first.
    const direct = tryParse(text.trim());
    if (direct) return direct;

    // 2) Try content inside markdown code fences (```json ... ```).
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch?.[1]) {
      const fenced = tryParse(fenceMatch[1].trim());
      if (fenced) return fenced;
    }

    // 3) Try extracting the first JSON object from surrounding text.
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = tryParse(text.slice(firstBrace, lastBrace + 1).trim());
      if (extracted) return extracted;
    }

    return null;
  }

  static async processMessage(
    userId: string,
    message: string,
    sessionId: string,
  ) {
    // 1. Get/Create chat
    let chat = await chatModel.findOne({ sessionId });
    const msgCount = await chatModel.countDocuments({ sessionId });
    // 2. Save user message
    chat.messages.push({ role: "user", content: message });

    // 3. Limit history
    const lastMessages = chat.messages.slice(-6);

    // 4. Convert to Gemini format
    const history = ChatService.formatHistory(lastMessages);
    const firstUserIndex = history.findIndex(
      (item: any) => item.role === "user",
    );
    const normalizedHistory =
      firstUserIndex === -1
        ? [{ role: "user", parts: [{ text: message }] }]
        : history.slice(firstUserIndex);

    // 5. Start Gemini chat
    const chatSession = model.startChat({ history: normalizedHistory });

    // 6. Send prompt
    const result = await chatSession.sendMessage(
      await ChatService.buildPrompt(message, msgCount),
    );

    const text = result.response.text();
    const aiData = ChatService.safeParseJSON(text);

    if (!aiData) {
      return {
        reply: "Sorry, I didn't understand. Please try again.",
        complaintCreated: false,
        complaintId: null,
        complaint: null,
      };
    }

    // 7. Decision: Create Complaint
    let complaint = null;

    if (aiData.isComplaint) {
      complaint = {
        complained_by: userId,
        category: aiData.category,
        priority: aiData.priority,
        description: aiData.description,
        title: aiData.title,
      };
    }

    // 8. Save assistant reply
    chat.messages.push({
      role: "assistant",
      content: aiData.reply,
    });

    await chat.save();

    // 9. Return response
    return {
      reply: aiData.reply,
      isComplain: !!complaint,
      sessionId,
      complaint: complaint || null,
    };
  }
}
