export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getRecentFlagged } from '@/lib/dataLoader';

export async function GET() {
  const data = getRecentFlagged(20);
  return NextResponse.json(data);
}
