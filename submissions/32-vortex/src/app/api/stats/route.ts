export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getStats } from '@/lib/dataLoader';

export async function GET() {
  const stats = getStats();
  return NextResponse.json(stats);
}
