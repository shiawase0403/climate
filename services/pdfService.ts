import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClimateDataResponse, ClassificationResponse, GeoLocation, ComparisonPoint } from '../types';

// Colors for Charts
const COLORS = {
  precip: [59, 130, 246], // #3b82f6 (Blue)
  temp: [239, 68, 68],    // #ef4444 (Red)
  grid: [203, 213, 225],  // #cbd5e1 (Slate 300)
  text: [71, 85, 105],    // #475569 (Slate 600)
  title: [15, 23, 42],    // #0f172a (Slate 900)
};

// Static English labels for PDF
const PDF_LABELS = {
  reportTitle: "Climate Analysis Report",
  compTitle: "Climate Comparison Report",
  generated: "Generated on",
  location: "Location",
  code: "Classification Code",
  temp: "Temperature",
  precip: "Precipitation",
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  monthsFull: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  monthHeader: "Month",
  tempHeader: "Temp (C)",
  precipHeader: "Precip (mm)"
};

// Helper to parse hex
const hexToRgb = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16)
  };
};

/**
 * Draw a single location climate chart (Bar + Line)
 */
const drawClimateChartPDF = (
  doc: jsPDF,
  data: any[],
  startX: number,
  startY: number,
  width: number,
  height: number
) => {
  const margin = { top: 10, right: 15, bottom: 20, left: 15 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const x0 = startX + margin.left;
  const y0 = startY + margin.top;
  const yBottom = y0 + chartH;

  const temps = data.map(d => d.temp);
  const precips = data.map(d => d.prec);
  
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const maxPrecip = Math.max(...precips) || 100;

  const tempRange = maxTemp - minTemp || 10;
  const tempMinDomain = Math.floor(minTemp - (tempRange * 0.1));
  const tempMaxDomain = Math.ceil(maxTemp + (tempRange * 0.1));
  const precMaxDomain = Math.ceil(maxPrecip * 1.1);

  // Grid
  doc.setFontSize(8);
  doc.setLineWidth(0.1);
  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);

  for (let i = 0; i <= 5; i++) {
    const y = yBottom - (chartH * (i / 5));
    doc.line(x0, y, x0 + chartW, y);
    
    const pVal = Math.round(precMaxDomain * (i / 5));
    doc.setTextColor(COLORS.precip[0], COLORS.precip[1], COLORS.precip[2]);
    doc.text(pVal.toString(), x0 - 2, y + 1, { align: 'right' });

    const tVal = (tempMinDomain + (tempMaxDomain - tempMinDomain) * (i / 5)).toFixed(1);
    doc.setTextColor(COLORS.temp[0], COLORS.temp[1], COLORS.temp[2]);
    doc.text(tVal.toString(), x0 + chartW + 2, y + 1, { align: 'left' });
  }

  // X Axis
  const stepX = chartW / 12;
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  data.forEach((d, i) => {
    const x = x0 + (i * stepX) + (stepX / 2);
    doc.text(PDF_LABELS.months[d.month - 1], x, yBottom + 5, { align: 'center' });
  });

  // Bars
  doc.setFillColor(COLORS.precip[0], COLORS.precip[1], COLORS.precip[2]);
  const barWidth = stepX * 0.6;
  const barOffset = (stepX - barWidth) / 2;

  data.forEach((d, i) => {
    const barHeight = (d.prec / precMaxDomain) * chartH;
    const x = x0 + (i * stepX) + barOffset;
    const y = yBottom - barHeight;
    const h = Math.max(barHeight, 0.2); 
    doc.rect(x, y, barWidth, h, 'F');
  });

  // Line
  doc.setDrawColor(COLORS.temp[0], COLORS.temp[1], COLORS.temp[2]);
  doc.setLineWidth(0.8);
  
  const getTempY = (val: number) => {
    const pct = (val - tempMinDomain) / (tempMaxDomain - tempMinDomain);
    return yBottom - (pct * chartH);
  };

  let prevX = 0;
  let prevY = 0;

  data.forEach((d, i) => {
    const x = x0 + (i * stepX) + (stepX / 2);
    const y = getTempY(d.temp);
    if (i > 0) doc.line(prevX, prevY, x, y);
    prevX = x;
    prevY = y;
  });

  doc.setFillColor(COLORS.temp[0], COLORS.temp[1], COLORS.temp[2]);
  data.forEach((d, i) => {
    const x = x0 + (i * stepX) + (stepX / 2);
    const y = getTempY(d.temp);
    doc.circle(x, y, 1.0, 'F');
  });
  
  if (tempMinDomain < 0 && tempMaxDomain > 0) {
    const yZero = getTempY(0);
    doc.setDrawColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
    doc.setLineWidth(0.2);
    doc.setLineDash([1, 1], 0);
    doc.line(x0, yZero, x0 + chartW, yZero);
    doc.setLineDash([], 0);
  }
};

/**
 * Draw Comparison Line Chart (Temperature)
 */
const drawComparisonLines = (
  doc: jsPDF,
  points: ComparisonPoint[],
  startX: number,
  startY: number,
  width: number,
  height: number
) => {
  const margin = { top: 15, right: 10, bottom: 20, left: 15 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const x0 = startX + margin.left;
  const y0 = startY + margin.top;
  const yBottom = y0 + chartH;

  const allValues = points.flatMap(p => p.data.data.map(d => d.temp));
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  const range = maxVal - minVal || 10;
  const minDomain = Math.floor(minVal - (range * 0.1));
  const maxDomain = Math.ceil(maxVal + (range * 0.1));

  // Grid & Axis
  doc.setFontSize(8);
  doc.setLineWidth(0.1);
  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

  doc.setFontSize(10);
  doc.text(PDF_LABELS.temp, startX, startY + 5);
  doc.setFontSize(8);

  for (let i = 0; i <= 5; i++) {
    const y = yBottom - (chartH * (i / 5));
    doc.line(x0, y, x0 + chartW, y);
    const val = (minDomain + (maxDomain - minDomain) * (i / 5)).toFixed(1);
    doc.text(val, x0 - 2, y + 1, { align: 'right' });
  }

  const stepX = chartW / 12;
  points[0].data.data.forEach((_, i) => {
    const x = x0 + (i * stepX) + (stepX / 2);
    doc.text(PDF_LABELS.months[i], x, yBottom + 5, { align: 'center' });
  });

  // Lines
  points.forEach((p) => {
    const { r, g, b } = hexToRgb(p.color);
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.5);

    let prevX = 0, prevY = 0;
    p.data.data.forEach((d, i) => {
      const val = d.temp;
      const x = x0 + (i * stepX) + (stepX / 2);
      const pct = (val - minDomain) / (maxDomain - minDomain);
      const y = yBottom - (pct * chartH);

      if (i > 0) doc.line(prevX, prevY, x, y);
      
      doc.setFillColor(r, g, b);
      doc.circle(x, y, 0.6, 'F');
      
      prevX = x;
      prevY = y;
    });
  });
};

/**
 * Draw Comparison Bar Chart (Precipitation)
 */
const drawComparisonBars = (
  doc: jsPDF,
  points: ComparisonPoint[],
  startX: number,
  startY: number,
  width: number,
  height: number
) => {
  const margin = { top: 15, right: 10, bottom: 20, left: 15 };
  const chartW = width - margin.left - margin.right;
  const chartH = height - margin.top - margin.bottom;
  const x0 = startX + margin.left;
  const y0 = startY + margin.top;
  const yBottom = y0 + chartH;

  const allValues = points.flatMap(p => p.data.data.map(d => d.prec));
  const maxVal = Math.max(...allValues);
  const maxDomain = Math.ceil(maxVal * 1.1) || 100;

  // Grid & Axis
  doc.setFontSize(8);
  doc.setLineWidth(0.1);
  doc.setDrawColor(COLORS.grid[0], COLORS.grid[1], COLORS.grid[2]);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

  doc.setFontSize(10);
  doc.text(PDF_LABELS.precip, startX, startY + 5);
  doc.setFontSize(8);

  for (let i = 0; i <= 5; i++) {
    const y = yBottom - (chartH * (i / 5));
    doc.line(x0, y, x0 + chartW, y);
    const val = Math.round(maxDomain * (i / 5));
    doc.text(val.toString(), x0 - 2, y + 1, { align: 'right' });
  }

  const stepX = chartW / 12;
  points[0].data.data.forEach((_, i) => {
    const x = x0 + (i * stepX) + (stepX / 2);
    doc.text(PDF_LABELS.months[i], x, yBottom + 5, { align: 'center' });
  });

  // Side-by-side Bars
  const numPoints = points.length;
  // Use 85% of the step width for the group of bars
  const groupWidth = stepX * 0.85;
  const barWidth = groupWidth / numPoints;
  const groupOffset = (stepX - groupWidth) / 2;

  points.forEach((p, pIndex) => {
    const { r, g, b } = hexToRgb(p.color);
    doc.setFillColor(r, g, b);

    p.data.data.forEach((d, mIndex) => {
      const barHeight = (d.prec / maxDomain) * chartH;
      if (barHeight > 0) {
        // Minimum height of 0.2 to show "something" if data exists but is small
        const h = Math.max(barHeight, 0.2); 
        const x = x0 + (mIndex * stepX) + groupOffset + (pIndex * barWidth);
        const y = yBottom - h;
        doc.rect(x, y, barWidth, h, 'F');
      }
    });
  });
};

/**
 * Generate PDF for Single Location
 */
export const generatePDF = async (
  location: GeoLocation,
  climateData: ClimateDataResponse,
  classification: ClassificationResponse,
  lang: string,
  t: any
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(COLORS.title[0], COLORS.title[1], COLORS.title[2]);
  doc.text(PDF_LABELS.reportTitle, margin, cursorY);
  cursorY += 10;

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  const dateStr = new Date().toLocaleDateString();
  const latStr = `${Math.abs(location.lat).toFixed(4)} ${location.lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(location.lng).toFixed(4)} ${location.lng >= 0 ? 'E' : 'W'}`;
  
  const mainClass = classification.data.find(c => c.type === 'K\u00f6ppen-Geiger' && c.text) || classification.data[0];
  const code = mainClass?.code || 'N/A';
  
  doc.text(`${PDF_LABELS.generated}: ${dateStr}`, margin, cursorY);
  cursorY += 6;
  doc.text(`${PDF_LABELS.location}: ${latStr}, ${lngStr}`, margin, cursorY);
  cursorY += 6;
  doc.text(`${PDF_LABELS.code}: ${code}`, margin, cursorY);
  cursorY += 15;

  // Draw Chart
  doc.setFontSize(14);
  doc.setTextColor(COLORS.title[0], COLORS.title[1], COLORS.title[2]);
  doc.text("Climate Chart", margin, cursorY);
  cursorY += 5;
  
  drawClimateChartPDF(doc, climateData.data, margin, cursorY, contentWidth, 90);
  cursorY += 100;

  // Draw Table
  doc.setFontSize(14);
  doc.text("Monthly Data", margin, cursorY);
  cursorY += 5;

  const tableBody = climateData.data.map(d => [
    PDF_LABELS.monthsFull[d.month - 1],
    d.temp.toFixed(1),
    d.prec.toFixed(1)
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [[PDF_LABELS.monthHeader, PDF_LABELS.tempHeader, PDF_LABELS.precipHeader]],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { font: 'helvetica', fontSize: 10 },
    margin: { left: margin, right: margin }
  });

  doc.save(`Climate_Report_${location.lat.toFixed(2)}_${location.lng.toFixed(2)}.pdf`);
};

/**
 * Generate PDF for Comparison
 */
export const generateComparisonPDF = async (
  points: ComparisonPoint[],
  lang: string,
  t: any
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let cursorY = 20;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(COLORS.title[0], COLORS.title[1], COLORS.title[2]);
  doc.text(PDF_LABELS.compTitle, margin, cursorY);
  cursorY += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.text(`${PDF_LABELS.generated}: ${new Date().toLocaleDateString()}`, margin, cursorY);
  cursorY += 10;

  // Legend
  doc.setFontSize(11);
  doc.text("Locations:", margin, cursorY);
  cursorY += 6;
  doc.setFontSize(9);
  
  points.forEach(p => {
    const { r, g, b } = hexToRgb(p.color);
    doc.setFillColor(r, g, b);
    doc.rect(margin, cursorY - 3, 3, 3, 'F');
    
    const label = `${Math.abs(p.location.lat).toFixed(2)} ${p.location.lat>=0?'N':'S'}, ${Math.abs(p.location.lng).toFixed(2)} ${p.location.lng>=0?'E':'W'}`;
    doc.text(label, margin + 5, cursorY);
    cursorY += 5;
  });
  cursorY += 5;

  // Charts
  const chartHeight = 70;
  
  // Temperature Line Chart
  drawComparisonLines(doc, points, margin, cursorY, contentWidth, chartHeight);
  cursorY += chartHeight + 15;
  
  // Precipitation Bar Chart (New)
  drawComparisonBars(doc, points, margin, cursorY, contentWidth, chartHeight);
  cursorY += chartHeight + 15;

  // Data Tables
  doc.addPage();
  cursorY = 20;

  // Temp Table
  doc.setFontSize(14);
  doc.setTextColor(COLORS.title[0], COLORS.title[1], COLORS.title[2]);
  doc.text("Temperature Comparison (°C)", margin, cursorY);
  cursorY += 5;

  const tempHeaders = [PDF_LABELS.monthHeader, ...points.map((_, i) => `Loc ${i+1}`)];
  const tempBody = PDF_LABELS.monthsFull.map((m, i) => {
    return [m, ...points.map(p => p.data.data[i].temp.toFixed(1))];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [tempHeaders],
    body: tempBody,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    styles: { font: 'helvetica', fontSize: 9 },
    margin: { left: margin, right: margin }
  });

  // Precip Table
  cursorY = (doc as any).lastAutoTable.finalY + 15;

  doc.text("Precipitation Comparison (mm)", margin, cursorY);
  cursorY += 5;

  const precipHeaders = [PDF_LABELS.monthHeader, ...points.map((_, i) => `Loc ${i+1}`)];
  const precipBody = PDF_LABELS.monthsFull.map((m, i) => {
    return [m, ...points.map(p => p.data.data[i].prec.toFixed(1))];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [precipHeaders],
    body: precipBody,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { font: 'helvetica', fontSize: 9 },
    margin: { left: margin, right: margin }
  });

  doc.save(`Climate_Comparison.pdf`);
};
