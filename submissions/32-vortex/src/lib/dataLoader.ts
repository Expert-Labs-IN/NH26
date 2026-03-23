import fs from 'fs';
import path from 'path';

export interface Transaction {
  Transaction_ID: string;
  User_ID: string;
  Timestamp: string;
  Amount_USD: number;
  Merchant_Category: string;
  Location_City: string;
  Status: 'Approved' | 'Flagged';
}

let cachedData: Transaction[] | null = null;
let simulationInterval: NodeJS.Timeout | null = null;
let isSimulatingFlag = false;

const MOCK_CITIES = ['New York', 'London', 'Tokyo', 'Lagos', 'Dubai', 'Moscow', 'São Paulo', 'Miami', 'Singapore', 'Mumbai'];
const MOCK_CATEGORIES = ['Crypto Exchange', 'Electronics', 'Luxury Goods', 'Travel', 'Online Gambling'];

export function startSimulation() {
  if (isSimulatingFlag) return;
  isSimulatingFlag = true;
  
  // Make sure data is loaded first
  loadTransactions();

  // Keep track of recent simulation users to trigger velocity/travel anomalies
  const activeSimUsers: string[] = [];

  simulationInterval = setInterval(() => {
    if (!cachedData) return;
    
    // Generate 1-3 new flagged transactions
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const isHighValue = Math.random() > 0.7;
      const amount = isHighValue ? Math.random() * 5000 + 1000 : Math.random() * 500 + 10;
      
      // 40% chance to reuse an active user to trigger velocity & travel anomalies
      let userId;
      if (Math.random() < 0.4 && activeSimUsers.length > 0) {
        userId = activeSimUsers[Math.floor(Math.random() * activeSimUsers.length)];
      } else {
        userId = `U-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
        activeSimUsers.push(userId);
        if (activeSimUsers.length > 10) activeSimUsers.shift();
      }
      
      const newTx: Transaction = {
        Transaction_ID: `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        User_ID: userId,
        Timestamp: new Date().toISOString(), // Current real time so it shows up as NEW
        Amount_USD: parseFloat(amount.toFixed(2)),
        Merchant_Category: MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)],
        Location_City: MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)],
        Status: 'Flagged',
      };
      
      cachedData.push(newTx);
    }
  }, 2000); // Add new data every 2 seconds
}

export function stopSimulation() {
  isSimulatingFlag = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

export function resetData() {
  // Clear the in-memory cache so it forces a fresh read from the CSV
  cachedData = null;
  stopSimulation();
}

export function getIsSimulating() {
  return isSimulatingFlag;
}

export function loadTransactions(): Transaction[] {
  if (cachedData) return cachedData;

  const csvPath = path.join(process.cwd(), 'data', 'FinTech_Fraud_Logs.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found at:', csvPath);
    return [];
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split(/\r?\n/);

  cachedData = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        Transaction_ID: values[0] || 'N/A',
        User_ID: values[1] || 'N/A',
        Timestamp: values[2] || new Date().toISOString(),
        Amount_USD: parseFloat(values[3] || '0'),
        Merchant_Category: values[4] || 'Other',
        Location_City: values[5] || 'Unknown',
        Status: (values[6] === 'Flagged' ? 'Flagged' : 'Approved') as 'Approved' | 'Flagged',
      };
    });

  return cachedData || [];
}

// Stats API
export function getStats() {
  const transactions = loadTransactions();
  const flagged = transactions.filter(tx => tx.Status === 'Flagged');
  
  // Weekend patterns
  const weekendFraud = flagged.filter(t => {
    const day = new Date(t.Timestamp).getDay();
    return day === 0 || day === 6;
  }).length;
  const weekendFraudPercent = flagged.length > 0 ? parseFloat(((weekendFraud / flagged.length) * 100).toFixed(1)) : 0;

  // Peak Hour
  const hourCounts: Record<number, number> = {};
  flagged.forEach(t => {
    const hour = new Date(t.Timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakFraudHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "0";

  const userFlags = new Map<string, number>();
  for (const tx of flagged) {
    userFlags.set(tx.User_ID, (userFlags.get(tx.User_ID) || 0) + 1);
  }
  const velocitySpikeUsers = Array.from(userFlags.values()).filter(count => count > 1).length;

  const merchantStats = getMerchantStats();
  const highestRisk = merchantStats[0];

  const travelCases = getImpossibleTravel();

  return {
    totalTransactions: transactions.length,
    flaggedTransactions: flagged.length,
    impossibleTravel: travelCases.length,
    velocitySpikeUsers,
    fraudRate: parseFloat(((flagged.length / transactions.length) * 100).toFixed(3)),
    highestRiskCategory: `${highestRisk?.name || 'N/A'} (${highestRisk?.fraudRate || 0}%)`,
    weekendFraudPercent,
    peakFraudHour: parseInt(peakFraudHour),
  };
}

// City Stats API
export function getCityStats() {
  const transactions = loadTransactions();
  const cityMap = new Map<string, { total: number; flagged: number; amount: number; flaggedAmount: number }>();

  for (const tx of transactions) {
    const city = tx.Location_City;
    if (!cityMap.has(city)) {
      cityMap.set(city, { total: 0, flagged: 0, amount: 0, flaggedAmount: 0 });
    }
    const stats = cityMap.get(city)!;
    stats.total++;
    stats.amount += tx.Amount_USD;
    if (tx.Status === 'Flagged') {
      stats.flagged++;
      stats.flaggedAmount += tx.Amount_USD;
    }
  }

  return Array.from(cityMap.entries())
    .map(([city, stats]) => ({
      city,
      transactions: stats.total,
      flagged: stats.flagged,
      fraudAmount: Math.round(stats.flaggedAmount),
      totalAmount: Math.round(stats.amount),
      rate: parseFloat(((stats.flagged / stats.total) * 100).toFixed(2)),
      trend: 0,
    }))
    .sort((a, b) => b.fraudAmount - a.fraudAmount);
}

// Merchant Stats API
export function getMerchantStats() {
  const transactions = loadTransactions();
  const merchantMap = new Map<string, { total: number; flagged: number; amount: number; flaggedAmount: number }>();

  for (const tx of transactions) {
    const merchant = tx.Merchant_Category;
    if (!merchantMap.has(merchant)) {
      merchantMap.set(merchant, { total: 0, flagged: 0, amount: 0, flaggedAmount: 0 });
    }
    const stats = merchantMap.get(merchant)!;
    stats.total++;
    stats.amount += tx.Amount_USD;
    if (tx.Status === 'Flagged') {
      stats.flagged++;
      stats.flaggedAmount += tx.Amount_USD;
    }
  }

  return Array.from(merchantMap.entries())
    .map(([name, stats]) => ({
      name,
      value: stats.total,
      fraudRate: parseFloat(((stats.flagged / stats.total) * 100).toFixed(2)),
      amount: Math.round(stats.amount),
      flaggedAmount: Math.round(stats.flaggedAmount),
      flagged: stats.flagged,
    }))
    .sort((a, b) => b.fraudRate - a.fraudRate);
}

// Heatmap API
export function getHeatmapData() {
  const transactions = loadTransactions();
  const heatmap = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.Status !== 'Flagged') continue;
    const date = new Date(tx.Timestamp);
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    heatmap.set(key, (heatmap.get(key) || 0) + 1);
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.flatMap(day =>
    Array.from({ length: 24 }).map((_, hour) => ({
      day,
      hour,
      count: heatmap.get(`${day}-${hour}`) || 0,
      rate: 0,
    }))
  );
}

// Feed API
export function getRecentFlagged(limit = 20) {
  const transactions = loadTransactions();
  return transactions
    .filter(tx => tx.Status === 'Flagged')
    .sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime())
    .slice(0, limit)
    .map(tx => ({
      transactionId: tx.Transaction_ID,
      userId: tx.User_ID,
      amount: tx.Amount_USD,
      city: tx.Location_City,
      category: tx.Merchant_Category,
      timestamp: tx.Timestamp,
    }));
}

// Repeat Offenders
export function getRepeatOffenders(limit = 12) {
  const transactions = loadTransactions();
  const userStats = new Map<string, { flags: number; amount: number; txCount: number }>();

  for (const tx of transactions) {
    if (!userStats.has(tx.User_ID)) {
      userStats.set(tx.User_ID, { flags: 0, amount: 0, txCount: 0 });
    }
    const stats = userStats.get(tx.User_ID)!;
    stats.txCount++;
    if (tx.Status === 'Flagged') {
      stats.flags++;
      stats.amount += tx.Amount_USD;
    }
  }

  return Array.from(userStats.entries())
    .filter(([_, stats]) => stats.flags > 0)
    .map(([userId, stats]) => ({
      userId,
      flags: stats.flags,
      totalAmount: Math.round(stats.amount),
      txCount: stats.txCount,
    }))
    .sort((a, b) => b.flags - a.flags || b.totalAmount - a.totalAmount)
    .slice(0, limit);
}

// Velocity API
export function getVelocityData() {
  const transactions = loadTransactions();
  const hourlyData = new Map<number, { volume: number; spikes: number }>();

  for (let i = 0; i < 24; i++) {
    hourlyData.set(i, { volume: 0, spikes: 0 });
  }

  for (const tx of transactions) {
    const hour = new Date(tx.Timestamp).getHours();
    const data = hourlyData.get(hour)!;
    data.volume++;
    if (tx.Status === 'Flagged') {
      data.spikes++;
    }
  }

  return Array.from(hourlyData.entries()).map(([hour, data]) => ({
    time: `${hour}:00`,
    hour,
    volume: data.volume,
    spikes: data.spikes,
  }));
}

// Impossible Travel
export function getImpossibleTravel(limit = 20) {
  const transactions = loadTransactions();
  const userTx = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (!userTx.has(tx.User_ID)) userTx.set(tx.User_ID, []);
    userTx.get(tx.User_ID)!.push(tx);
  }

  const travelCases: any[] = [];
  for (const [userId, txs] of userTx.entries()) {
    const sorted = txs.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev.Location_City !== curr.Location_City) {
        const timeDiff = (new Date(curr.Timestamp).getTime() - new Date(prev.Timestamp).getTime()) / 60000;
        if (timeDiff > 0 && timeDiff < 60) {
          travelCases.push({
            userId,
            tx1: { city: prev.Location_City, timestamp: prev.Timestamp, amount: prev.Amount_USD },
            tx2: { city: curr.Location_City, timestamp: curr.Timestamp, amount: curr.Amount_USD },
            timeDiffMinutes: Math.max(1, Math.round(timeDiff)),
          });
        }
      }
    }
  }

  return travelCases.sort((a, b) => a.timeDiffMinutes - b.timeDiffMinutes).slice(0, limit);
}

// Threshold API
export function getThresholdData() {
  const transactions = loadTransactions();
  const threshold = 500;
  const below = { count: 0, flagged: 0, amount: 0 };
  const above = { count: 0, flagged: 0, amount: 0 };

  for (const tx of transactions) {
    if (tx.Amount_USD < threshold) {
      below.count++;
      below.amount += tx.Amount_USD;
      if (tx.Status === 'Flagged') below.flagged++;
    } else {
      above.count++;
      above.amount += tx.Amount_USD;
      if (tx.Status === 'Flagged') above.flagged++;
    }
  }

  return {
    threshold,
    below: { count: below.count, flagged: below.flagged, amount: Math.round(below.amount) },
    above: { count: above.count, flagged: above.flagged, amount: Math.round(above.amount) },
  };
}

// City Pairs
export function getCityPairs() {
  const transactions = loadTransactions();
  const userTx = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (!userTx.has(tx.User_ID)) userTx.set(tx.User_ID, []);
    userTx.get(tx.User_ID)!.push(tx);
  }

  const pairCounts = new Map<string, number>();
  const cities = new Set<string>();

  for (const txs of userTx.values()) {
    const sorted = txs.sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev.Location_City !== curr.Location_City) {
        const pair = [prev.Location_City, curr.Location_City].sort().join('->');
        pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
        cities.add(prev.Location_City);
        cities.add(curr.Location_City);
      }
    }
  }

  const nodes = Array.from(cities).map((id, index) => ({ id, group: index % 3 }));
  const links = Array.from(pairCounts.entries())
    .map(([pair, value]) => {
      const [source, target] = pair.split('->');
      return { source, target, value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  return { nodes, links };
}

// All transactions
export function getAllTransactions(page = 1, pageSize = 50, filters?: { status?: string; city?: string; merchant?: string }) {
  let transactions = loadTransactions();
  if (filters?.status) transactions = transactions.filter(tx => tx.Status === filters.status);
  if (filters?.city) transactions = transactions.filter(tx => tx.Location_City === filters.city);
  if (filters?.merchant) transactions = transactions.filter(tx => tx.Merchant_Category === filters.merchant);

  const total = transactions.length;
  const sorted = transactions.sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return { data: paginated, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getData() {
  const stats = getStats();
  return {
    stats: { ...stats, flaggedCount: stats.flaggedTransactions },
    merchantFraud: getMerchantStats().map(m => ({ ...m, total: m.value, fraud: m.flagged, rate: m.fraudRate })),
    cityFraud: getCityStats().map(c => ({ ...c, total: c.transactions, fraud: c.flagged })),
    repeatOffenders: getRepeatOffenders().map(o => ({ ...o, flagCount: o.flags })),
    impossibleTravel: getImpossibleTravel().map(t => ({ ...t, flagCount: 1 })),
  };
}

export function getInsights() {
  const merchantStats = getMerchantStats();
  const offenders = getRepeatOffenders();
  const topOffender = offenders[0];
  const highRiskCat = merchantStats[0];

  const analysis = [
    topOffender ? `CRITICAL: User ${topOffender.userId} flagged ${topOffender.flags} times ($${topOffender.totalAmount.toLocaleString()})` : null,
    highRiskCat ? `PATTERN: ${highRiskCat.name} is the highest risk category with a ${highRiskCat.fraudRate}% fraud rate.` : null,
    `RECOMMENDATION: Apply strict multi-factor authentication for all transactions exceeding $500 in ${getCityStats()[0]?.city || 'high-risk urban centers'}.`
  ].filter(Boolean).join('\n\n');

  return { insight: analysis };
}
