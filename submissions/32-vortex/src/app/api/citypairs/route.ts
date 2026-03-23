export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getCityPairs } from '@/lib/dataLoader';

export async function GET() {
  const data = getCityPairs();
  return NextResponse.json(data);
}
