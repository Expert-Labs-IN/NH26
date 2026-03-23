export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getImpossibleTravel } from '@/lib/dataLoader';

export async function GET() {
  const data = getImpossibleTravel(20);
  return NextResponse.json(data);
}
