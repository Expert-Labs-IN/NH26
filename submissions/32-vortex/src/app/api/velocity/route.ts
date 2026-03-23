export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getVelocityData } from '@/lib/dataLoader';

export async function GET() {
  const data = getVelocityData();
  return NextResponse.json(data);
}
