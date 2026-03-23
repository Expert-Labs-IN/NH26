"use client";

import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// Use Helvetica (built-in) - no external font loading needed
// This avoids font embedding issues with web fonts

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2px solid #e2e8f0',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
  },
  titleAccent: {
    color: '#4f46e5',
  },
  timestamp: {
    fontSize: 10,
    color: '#64748b',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    border: '1px solid #e2e8f0',
  },
  kpiCardDark: {
    backgroundColor: '#4f46e5',
  },
  kpiCardHighlight: {
    backgroundColor: '#ffffff',
    border: '1px solid #fca5a5',
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#64748b',
    marginBottom: 4,
  },
  kpiLabelDark: {
    color: '#c7d2fe',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 2,
  },
  kpiValueDark: {
    color: '#ffffff',
  },
  kpiValueHighlight: {
    color: '#dc2626',
  },
  kpiSubtitle: {
    fontSize: 9,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  kpiSubtitleDark: {
    color: '#a5b4fc',
  },
  chartImage: {
    width: '100%',
    marginTop: 10,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  metricsTable: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e2e8f0',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
  },
  tableCellHeader: {
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    fontSize: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
  },
  pageNumber: {
    fontSize: 8,
    color: '#94a3b8',
  },
});

export interface DashboardPDFProps {
  stats: {
    totalTransactions: number;
    flaggedTransactions: number;
    impossibleTravel: number;
    velocitySpikeUsers: number;
    fraudRate: number;
    highestRiskCategory: string;
    weekendFraudPercent: number;
    peakFraudHour: number;
  };
  cityStats?: Array<{
    city: string;
    flagged: number;
    fraudAmount: number;
    rate: number;
  }>;
  merchantStats?: Array<{
    name: string;
    value: number;
    fraudRate: number;
    flaggedAmount: number;
  }>;
  chartImages?: {
    velocity?: string;
    heatmap?: string;
    merchant?: string;
    city?: string;
    falsePositive?: string;
    threatRadar?: string;
  };
  generatedAt: string;
}

export function DashboardPDF({ stats, cityStats, merchantStats, chartImages, generatedAt }: DashboardPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoIcon} />
            <Text style={styles.title}>
              Fraud<Text style={styles.titleAccent}>Shield</Text> Report
            </Text>
          </View>
          <Text style={styles.timestamp}>Generated: {generatedAt}</Text>
        </View>

        {/* Core Analytics KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Analytics</Text>
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, styles.kpiCardDark]}>
              <Text style={[styles.kpiLabel, styles.kpiLabelDark]}>Total Transactions</Text>
              <Text style={[styles.kpiValue, styles.kpiValueDark]}>
                {stats.totalTransactions.toLocaleString()}
              </Text>
              <Text style={[styles.kpiSubtitle, styles.kpiSubtitleDark]}>All time volume</Text>
            </View>

            <View style={[styles.kpiCard, styles.kpiCardHighlight]}>
              <Text style={styles.kpiLabel}>Flagged Transactions</Text>
              <Text style={[styles.kpiValue, styles.kpiValueHighlight]}>
                {stats.flaggedTransactions.toLocaleString()}
              </Text>
              <Text style={styles.kpiSubtitle}>{stats.fraudRate}% fraud rate</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Impossible Travel</Text>
              <Text style={styles.kpiValue}>{stats.impossibleTravel}</Text>
              <Text style={styles.kpiSubtitle}>Geo-anomaly cases</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Velocity Spikes</Text>
              <Text style={styles.kpiValue}>{stats.velocitySpikeUsers}</Text>
              <Text style={styles.kpiSubtitle}>High-freq users</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Highest Risk Category</Text>
              <Text style={[styles.kpiValue, { fontSize: 14 }]}>{stats.highestRiskCategory}</Text>
              <Text style={styles.kpiSubtitle}>By percentage</Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Peak Fraud Hour</Text>
              <Text style={styles.kpiValue}>{stats.peakFraudHour}:00</Text>
              <Text style={styles.kpiSubtitle}>{stats.weekendFraudPercent}% on weekends</Text>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        {chartImages?.velocity && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Velocity</Text>
            <Image src={chartImages.velocity} style={styles.chartImage} />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>FraudShield Analytics Report</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2: Geographic & Merchant Data */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Risk Intelligence</Text>
        </View>

        <View style={styles.twoColumn}>
          {/* City Stats Table */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Top Risk Cities</Text>
            <View style={styles.metricsTable}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>City</Text>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>Flagged</Text>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>Exposure</Text>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>Rate</Text>
              </View>
              {cityStats && cityStats.length > 0 ? (
                cityStats.slice(0, 8).map((city, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{city.city}</Text>
                    <Text style={styles.tableCell}>{city.flagged}</Text>
                    <Text style={styles.tableCell}>${(city.fraudAmount / 1000).toFixed(1)}K</Text>
                    <Text style={styles.tableCell}>{city.rate}%</Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { textAlign: 'center' }]}>No data available</Text>
                </View>
              )}
            </View>
          </View>

          {/* Merchant Stats Table */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Merchant Categories</Text>
            <View style={styles.metricsTable}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>Category</Text>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>Transactions</Text>
                <Text style={[styles.tableCell, styles.tableCellHeader]}>Fraud %</Text>
              </View>
              {merchantStats && merchantStats.length > 0 ? (
                merchantStats.slice(0, 8).map((merchant, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{merchant.name}</Text>
                    <Text style={styles.tableCell}>{merchant.value}</Text>
                    <Text style={styles.tableCell}>{merchant.fraudRate}%</Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={[styles.tableCell, { textAlign: 'center' }]}>No data available</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Charts */}
        {chartImages?.heatmap && (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Fraud Heatmap</Text>
            <Image src={chartImages.heatmap} style={styles.chartImage} />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>FraudShield Analytics Report</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 3: Threat Intelligence Charts */}
      {(chartImages?.threatRadar || chartImages?.merchant || chartImages?.falsePositive) && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Threat Intelligence</Text>
          </View>

          <View style={styles.twoColumn}>
            {chartImages?.threatRadar && (
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Attack Signature</Text>
                <Image src={chartImages.threatRadar} style={styles.chartImage} />
              </View>
            )}
            {chartImages?.merchant && (
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Transaction Volume</Text>
                <Image src={chartImages.merchant} style={styles.chartImage} />
              </View>
            )}
          </View>

          {chartImages?.falsePositive && (
            <View style={[styles.section, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>False Positive Trend</Text>
              <Image src={chartImages.falsePositive} style={styles.chartImage} />
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>FraudShield Analytics Report</Text>
            <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  );
}
