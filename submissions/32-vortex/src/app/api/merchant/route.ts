export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getMerchantStats } from '@/lib/dataLoader';

export async function GET() {
  const data = getMerchantStats();
  return NextResponse.json(data);
}
