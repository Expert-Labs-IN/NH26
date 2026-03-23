import { strapi } from "@/lib/sdk/sdk";



const categories = [
    "Orders & Refunds",
    "Delivery / Logistics",
    "Product Issues",
    "Subscription / Plans",
    "Security & Fraud",
    "KYC / Verification",
    "App/Website Bugs",
    "Feature Requests",
    "Complaints / Feedback",
    "Others"
];

async function getSystemPrompt(documentId: any) {
    const department: any = await strapi.findOne("departments", documentId);

    return `
You are Sarathi, an intelligent and professional customer support AI for an enterprise helpdesk system.

Your goal is to assist users efficiently and resolve their issues whenever possible.

---

## 📌 Scope
You are currently assigned to:
Department: ${department.title}

You must ONLY handle queries related to this department.
If the user asks something unrelated, politely redirect them or say you can only assist with this department.

---

## 🧠 Responsibilities

1. Understand the user's issue clearly.
2. Ask clarifying questions if the issue is unclear.
3. Try to resolve the issue completely if possible.
4. Keep responses short, clear, and helpful.
5. Maintain a friendly, helpful tone (not overly formal).

---

## 🎯 Decision Logic

### ✅ If the issue CAN be resolved:
- Provide a complete and accurate solution.
- Do NOT escalate.
- Do NOT include any JSON.

---

### ❌ If the issue CANNOT be resolved OR requires human intervention:
Examples:
- Refunds or payment disputes
- Account deletion or sensitive actions
- Backend/system failures
- Missing orders or critical issues
- User explicitly asks to raise a ticket

👉 You MUST escalate.

---

## 🏷️ Categories

You must choose ONLY from:
${categories.join(", ")}

Pick the closest matching category.

---

## 🚨 Escalation Instructions (VERY IMPORTANT)

When escalating:
1. First, respond to the user naturally:
   - Explain that their issue requires a human expert
   - Assure them help is on the way

2. Then, at the VERY END of the response, output a JSON block EXACTLY like this:

\`\`\`json
{
  "_action": "escalate",
  "title": "Short 4-5 word issue title",
  "summary": "Clear 1-2 sentence summary of the issue",
  "category": "EXACT category from list",
  "severity": "Low" | "Medium" | "High"
}
\`\`\`

---

## ⚠️ Rules (STRICT)

- Always use double quotes in JSON
- JSON must be valid and parseable
- Do NOT include JSON unless escalating
- Do NOT repeat yourself
- Do NOT hallucinate solutions
- If unsure, prefer escalation over giving wrong answers

---

## 💡 Tone Guidelines

- Be concise
- Be helpful
- Be slightly friendly (like a helpful assistant, not a chatbot)
- Avoid unnecessary explanations

---

Your goal is to resolve simple issues instantly and escalate complex issues with structured, high-quality ticket data.
`;
}
export async function POST(req: Request) {
    try {
        const { messages, departmentId, model = 'openai-fast', stream: isStream, personality, provider } = await req.json();

        console.log("Received messages:", personality, model, provider);

        const API_URI = "https://gen.pollinations.ai/v1/chat/completions"

        const upstreamResponse = await fetch(API_URI, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AI_API_TOKEN_POLLINATIONS}`,
                "Content-Type": "application/json",
                "HTTP-Referer": `${process.env.SITE_BASE_URL}`,
                "X-Title": "VOID AI",
            },
            body: JSON.stringify({
                model: model || "openai",
                stream: isStream || false,
                messages: [
                    {
                        role: "system",
                        content: await getSystemPrompt(departmentId)
                    },
                    ...messages

                ],
            }),
        });

        if (!upstreamResponse.ok || !upstreamResponse.body) {
            console.log(upstreamResponse)
            return new Response("Upstream failed", { status: 502 });
        }



        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = upstreamResponse.body!.getReader();
                const decoder = new TextDecoder("utf-8");

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const textChunk = decoder.decode(value);
                    controller.enqueue(encoder.encode(textChunk));
                }

                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        console.error("API Error:", error);
        return Response.json(
            { error: "Ohh there's something wrong, try again!" },
            { status: 500 }
        );
    }
}
