import { NextResponse } from 'next/server';
import { loadTransactions } from '@/lib/dataLoader';
import * as XLSX from 'xlsx';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const transactions = loadTransactions();
    
    // Sort transactions by timestamp (newest first)
    const sortedTx = [...transactions].sort((a, b) => 
      new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
    );

    // Filter to just get recent ones or all of them depending on need, let's export all for the "full dashboard" feel
    // Or we could split them into sheets

    // 1. All Transactions Sheet
    const wsAll = XLSX.utils.json_to_sheet(sortedTx);

    // 2. Only Flagged Sheet
    const flaggedTx = sortedTx.filter(tx => tx.Status === 'Flagged');
    const wsFlagged = XLSX.utils.json_to_sheet(flaggedTx);

    // Create workbook and add sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsAll, "All Transactions");
    XLSX.utils.book_append_sheet(wb, wsFlagged, "Flagged Only");

    // Write to buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="FraudShield_Export.xlsx"'
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}
