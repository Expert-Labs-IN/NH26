export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getInsights } from '@/lib/dataLoader';

export async function GET() {
  const insights = getInsights();
  return NextResponse.json(insights);
}
