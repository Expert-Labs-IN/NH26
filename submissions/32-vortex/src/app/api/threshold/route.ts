export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getThresholdData } from '@/lib/dataLoader';

export async function GET() {
  const data = getThresholdData();
  return NextResponse.json(data);
}
