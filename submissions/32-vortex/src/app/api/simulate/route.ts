export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { startSimulation, stopSimulation, getIsSimulating } from '@/lib/dataLoader';

export async function POST(req: Request) {
  const { action } = await req.json();
  
  if (action === 'start') {
    startSimulation();
    return NextResponse.json({ status: 'started' });
  } else if (action === 'stop') {
    stopSimulation();
    return NextResponse.json({ status: 'stopped' });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({ isSimulating: getIsSimulating() });
}
