export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getCityStats } from '@/lib/dataLoader';

export async function GET() {
  const cityData = getCityStats();
  return NextResponse.json(cityData);
}
