import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GROQ_API_KEY = process.env.GROQ_API_KEY!;

const supabase = createClient(SB_URL, SB_KEY);

export async function processSupportChat(message: string, history: any[]) {
    console.log("--- AI NEURAL HUB: PROCESSING ---");

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `You are the WorkSync AI Support Engine, the "First Line of Defense" for the enterprise. 
                        
                        PRIMARY GOAL: Deflect tickets by resolving issues immediately through conversational guidance.
                        
                        BEHAVIOR PROTOCOL:
                        1. ANALYZE & SOLVE: If the issue can be solved via instructions (e.g. "how to reset VPN", "where is the payroll form"), provide clear, step-by-step help.
                        2. VERIFY: After providing instructions, ask: "Did that resolve your issue, or would you like me to hand this off to a human agent?"
                        3. ESCALATE: ONLY if instructions fail, or the issue REQUIRES human action (e.g. broken hardware, salary error), offer a ticket.
                        
                        MODES:
                        - HELP: Resolve directly.
                        - TRIAGE: If unresolved, ASK: "I'll escalate this to the [Department] team. Should I open an official ticket for you?"
                        
                        TRIGGER: ONLY if the user confirms "yes/ok", output:
                           TICKET_CREATE: {"title": "Summary", "priority": "Low|Medium|High|Critical", "category": "IT|HR|Finance|Facilities", "reason": "Bot deflection failed"}
                           Followed by: "Understood. I have drafted Ticket #... and signaled a human agent for priority resolution."
                        
                        CONTEXT: Current user: Jordan Smith (ID: 27461570).`
                    },
                    ...history.map(h => ({ role: h.role === 'ai' ? 'assistant' : 'user', content: h.content })),
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
        const data = await response.json();
        const aiText = data.choices[0].message.content;

        if (aiText.includes('TICKET_CREATE:')) {
            const lines = aiText.split('\n');
            const targetLine = lines.find((l: string) => l.includes('TICKET_CREATE:'));
            if (targetLine) {
                const rawJson = targetLine.replace('TICKET_CREATE:', '').trim();
                const details = JSON.parse(rawJson);

                // Using only columns that definitely exist
                const { data: ticketData, error } = await supabase
                    .from('tickets')
                    .insert([{
                        title: `[AI] ${details.title}`,
                        status: 'Open',
                        priority: details.priority,
                        agent: 'Neural-Node',
                        ai_summary: `[Category: ${details.category}] [User ID: 27461570] Issue: ${message}`,
                        ai_decision: `System reasoning: ${details.reason}`
                    }])
                    .select();

                if (error) throw error;

                const ticketId = ticketData?.[0]?.id || "SYNC-ERROR";
                const cleanAiText = aiText.split('\n').filter((line: string) => !line.includes('TICKET_CREATE:')).join('\n');
                return cleanAiText.replace(/#\.\.\./, `#${ticketId}`);
            }
        }

        return aiText;

    } catch (err: any) {
        console.error("Neural Error:", err.message);
        return `I encountered a neural synchronization issue. Please try again soon.`;
    }
}
