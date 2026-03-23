"use client";

import { pdf } from '@react-pdf/renderer';
import { toPng } from 'html-to-image';
import { DashboardPDF, type DashboardPDFProps } from './DashboardPDF';

// Capture a chart element as a base64 image with font handling
async function captureChart(selector: string): Promise<string | undefined> {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return undefined;

  try {
    // Clone and fix font issues before capture
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
      // Fix the font undefined error by providing explicit font style
      style: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      // Filter function to handle problematic SVG elements
      filter: (node) => {
        // Skip any elements that might cause font issues
        if (node instanceof Element) {
          const tagName = node.tagName?.toLowerCase();
          // Keep all elements but ensure they have valid font
          if (tagName === 'text' || tagName === 'tspan') {
            // Check if font-family is set, if not, it will use the style we set above
            return true;
          }
        }
        return true;
      },
    });
    return dataUrl;
  } catch (err) {
    console.warn(`Failed to capture chart ${selector}:`, err);
    return undefined;
  }
}

// Alternative capture method using canvas directly for problematic charts
async function captureChartFallback(selector: string): Promise<string | undefined> {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) return undefined;

  try {
    // Try with more aggressive font fixing
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Fix all text elements in the clone
    const textElements = clonedElement.querySelectorAll('text, tspan');
    textElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.fontFamily = 'Arial, sans-serif';
    });

    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.appendChild(clonedElement);
    document.body.appendChild(container);

    const dataUrl = await toPng(clonedElement, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });

    document.body.removeChild(container);
    return dataUrl;
  } catch (err) {
    console.warn(`Fallback capture failed for ${selector}:`, err);
    return undefined;
  }
}

// Capture with retry logic
async function captureChartWithRetry(selector: string): Promise<string | undefined> {
  // First try standard capture
  let result = await captureChart(selector);
  
  // If failed, try fallback method
  if (!result) {
    result = await captureChartFallback(selector);
  }
  
  return result;
}

export interface ExportOptions {
  includeCharts?: boolean;
  chartSelectors?: {
    velocity?: string;
    heatmap?: string;
    merchant?: string;
    city?: string;
    falsePositive?: string;
    threatRadar?: string;
  };
}

export async function exportDashboardToPDF(
  stats: DashboardPDFProps['stats'],
  cityStats?: DashboardPDFProps['cityStats'],
  merchantStats?: DashboardPDFProps['merchantStats'],
  options: ExportOptions = {}
): Promise<void> {
  // Debug logging
  console.log('PDF Export - Stats:', stats);
  console.log('PDF Export - City Stats:', cityStats);
  console.log('PDF Export - Merchant Stats:', merchantStats);
  
  const {
    includeCharts = true,
    chartSelectors = {
      velocity: '[data-chart="velocity"]',
      heatmap: '[data-chart="heatmap"]',
      merchant: '[data-chart="merchant"]',
      city: '[data-chart="city"]',
      falsePositive: '[data-chart="false-positive"]',
      threatRadar: '[data-chart="threat-radar"]',
    },
  } = options;

  let chartImages: DashboardPDFProps['chartImages'] = {};

  if (includeCharts) {
    // Capture all charts in parallel with error handling
    const [velocity, heatmap, merchant, city, falsePositive, threatRadar] = await Promise.all([
      chartSelectors.velocity ? captureChartWithRetry(chartSelectors.velocity) : undefined,
      chartSelectors.heatmap ? captureChartWithRetry(chartSelectors.heatmap) : undefined,
      chartSelectors.merchant ? captureChartWithRetry(chartSelectors.merchant) : undefined,
      chartSelectors.city ? captureChartWithRetry(chartSelectors.city) : undefined,
      chartSelectors.falsePositive ? captureChartWithRetry(chartSelectors.falsePositive) : undefined,
      chartSelectors.threatRadar ? captureChartWithRetry(chartSelectors.threatRadar) : undefined,
    ]);

    chartImages = {
      velocity,
      heatmap,
      merchant,
      city,
      falsePositive,
      threatRadar,
    };
  }

  const generatedAt = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Generate PDF
  const doc = (
    <DashboardPDF
      stats={stats}
      cityStats={cityStats}
      merchantStats={merchantStats}
      chartImages={chartImages}
      generatedAt={generatedAt}
    />
  );

  const blob = await pdf(doc).toBlob();
  
  // Download the PDF
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FraudShield_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
