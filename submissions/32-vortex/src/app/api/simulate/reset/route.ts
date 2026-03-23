export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { resetData } from '@/lib/dataLoader';

export async function POST() {
  resetData();
  return NextResponse.json({ status: 'reset' });
}
