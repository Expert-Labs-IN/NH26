import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
    try {
        const { title, description, departments } = await req.json();

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
        }

        const API_URI = "https://gen.pollinations.ai/v1/chat/completions"

        const prompt = `
            Analyze the following support ticket and determine the most appropriate 'Priority Level' (severity), 'Issue Category', and the most suitable 'Department' from the provided list.
            
            Ticket Title: "${title}"
            Ticket Description: "${description}"
            
            Departments (Pick the ID of the best match):
            ${departments ? JSON.stringify(departments) : "N/A"}
            
            ---
            Priority Levels (Strictly pick one): 
            - Low
            - Medium
            - High
            - Critical
            
            ---
            Issue Categories (Strictly pick one):
           
            ${categories.join(", ")}
            
            ---
            Return ONLY a valid JSON object without any markdown formatting or extra text. Output should look exactly like this:
            {
                "severity": "High",
                "category": "Technical Error",
                "departmentId": "ID_OF_BEST_DEPARTMENT",
                "reasoning": "Clear 1-sentence reason for this classification"
            }
        `;

        const response = await fetch(API_URI, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.AI_API_TOKEN_POLLINATIONS}`,

            },
            body: JSON.stringify({
                model: "openai-fast",
                messages: [
                    {
                        role: "system",
                        content: prompt
                    }
                ],
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error("AI API failed");
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("No AI response");

        // Identification of pure JSON block
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart === -1) throw new Error("Invalid AI JSON format");

        const result = JSON.parse(content.substring(jsonStart, jsonEnd + 1));

        return NextResponse.json(result);
    } catch (error) {
        console.error("AI Ticket Analysis Error:", error);
        return NextResponse.json({ error: "Failed to analyze ticket with AI." }, { status: 500 });
    }
}
