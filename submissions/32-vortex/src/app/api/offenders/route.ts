export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getRepeatOffenders } from '@/lib/dataLoader';

export async function GET() {
  const data = getRepeatOffenders(12);
  return NextResponse.json(data);
}
