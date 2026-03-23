import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        console.log("Omnidim Webhook Intake (Aligned Mode)");

        const callId = payload.call_id || `VOICE-${Date.now()}`;
        const callReport = payload.call_report || {};
        const summary = callReport.summary || "Voice call received.";
        const fullTranscript = callReport.full_conversation || "Pending.";

        // ALIGNED INSERTION: Using only columns known to exist in the database
        const { data, error } = await supabase.from('tickets').insert([{
            title: `Voice AI: ${callId.toString().slice(-8)}`,
            status: 'Open',
            priority: 'Medium',     // Confirmed column
            agent: 'Neural-Desk',   // Confirmed column
            ai_summary: summary,    // Confirmed column
            ai_decision: fullTranscript.slice(0, 500) // Confirmed column (temp storage for transcript sample)
        }]).select();

        if (error) {
            console.error("Webhook Supabase Error:", error.message);
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: "Ticket created (Aligned)",
            ticketId: data[0].id
        });

    } catch (err: any) {
        console.error("Aligned Webhook Failure:", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
