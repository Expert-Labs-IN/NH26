export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getHeatmapData } from '@/lib/dataLoader';

export async function GET() {
  const data = getHeatmapData();
  return NextResponse.json(data);
}
