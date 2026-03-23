export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { loadTransactions, getImpossibleTravel, getRepeatOffenders } from "@/lib/dataLoader";

export async function GET() {
  try {
    const data = loadTransactions();
    const travel = getImpossibleTravel(100);
    const offenders = getRepeatOffenders(100);

    const flaggedData = data.filter(d => d.Status === 'Flagged');
    const totalFraud = flaggedData.length;
    
    // Calculate category focus (Crypto + Electronics)
    const cryptoElecCount = flaggedData.filter(d => d.Merchant_Category === 'Crypto Exchange' || d.Merchant_Category === 'Electronics').length;
    const categoryFocus = totalFraud > 0 ? Math.round((cryptoElecCount / totalFraud) * 100) : 0;
    
    // Geographic anomalies score
    const geoAnomalies = Math.min(100, Math.round((travel.length / 50) * 100));
    
    // Velocity spikes score
    const velocitySpikes = Math.min(100, Math.round((offenders.length / 30) * 100));
    
    // Off-hours fraud score
    const nightTimeFraud = flaggedData.filter(d => {
      const hour = new Date(d.Timestamp).getHours();
      return hour >= 0 && hour <= 6;
    }).length;
    const offHours = totalFraud > 0 ? Math.min(100, Math.round((nightTimeFraud / totalFraud) * 300)) : 0;

    // High Ticket score
    const highTicketFraud = flaggedData.filter(d => d.Amount_USD > 3000).length;
    const highTicket = totalFraud > 0 ? Math.min(100, Math.round((highTicketFraud / totalFraud) * 200)) : 0;

    // Small transactions (Card testing pattern)
    const cardTesting = flaggedData.filter(d => d.Amount_USD < 50).length;
    const cardTestingScore = totalFraud > 0 ? Math.min(100, Math.round((cardTesting / totalFraud) * 150)) : 0;

    // We return a "Radar" shape of the current attack vector
    return NextResponse.json([
      { subject: 'Velocity Spikes', score: velocitySpikes, fullMark: 100 },
      { subject: 'Geo-Hopping', score: geoAnomalies, fullMark: 100 },
      { subject: 'Crypto Target', score: categoryFocus, fullMark: 100 },
      { subject: 'Off-Hours', score: offHours, fullMark: 100 },
      { subject: 'High Ticket', score: highTicket, fullMark: 100 },
      { subject: 'Card Testing', score: cardTestingScore, fullMark: 100 },
    ]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load radar data' }, { status: 500 });
  }
}
