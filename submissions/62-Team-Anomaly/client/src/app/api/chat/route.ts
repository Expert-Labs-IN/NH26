import { NextResponse } from 'next/server';
import { processSupportChat } from '@/lib/ai-actions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();
        const aiResponse = await processSupportChat(message, history);
        return NextResponse.json({ response: aiResponse });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
