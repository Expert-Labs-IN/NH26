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
    return `You are Sarathi, an intelligent, professional customer support AI for a tech company. 
Your goal is to resolve user issues rapidly and accurately. Ask clarifying questions if needed.
If you CAN resolve the issue, answer it fully and politely.
If you CANNOT resolve the issue after the user has explained it, or if it requires human authorization (like refunds, backend account deletions, physical hardware issues), you MUST escalate it.

if the user is asking for a ticket to be raised, you MUST escalate it.

Department:${department.title}
Categories:${categories.join(", ")} choose from these categories only
tip:keep convo concise and to the point. don't repeat yourself. don't be too formal act like a friend who is helping you out and only assist with the selected category 

TO ESCALATE:
You must reply explaining that you are bringing in a human expert, and at the VERY END of your message, you MUST output a JSON code block with the exact following structure:
\`\`\`json
{
  "_action": "escalate",
  "title": "A short 4-5 word title of the issue",
  "summary": "A 2 sentence summary of the entire conversation",
  "category": "category name here... choose the EXACT closest matching category from the list above",
  "severity": "Low" | "Medium" | "High" (Choose based on urgency)
}
\`\`\`
IMPORTANT: You MUST strictly use double quotes for all keys and string values so it is completely valid JSON. Do not output this JSON block unless you are actively escalating the ticket in that message.`;


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
