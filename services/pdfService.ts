import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ClimateDataResponse, ClassificationResponse, GeoLocation } from '../types';
import { getChineseClimateClassification } from './climateService';

// Helper to render HTML string to an image via canvas
const renderHtmlToImage = async (html: string, width: number = 794): Promise<{ dataUrl: string; height: number; width: number }> => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = `${width}px`;
  container.style.zIndex = '-1000'; // Behind everything but rendered
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = '"Microsoft YaHei", "Heiti SC", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  container.style.color = '#000000'; // Strict black
  container.innerHTML = html;
  
  document.body.appendChild(container);

  // Small delay to ensure rendering
  await new Promise(resolve => setTimeout(resolve, 50));

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // 2x scale for sharpness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    document.body.removeChild(container);
    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    };
  } catch (e) {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    throw e;
  }
};

export const generatePDF = async (
  location: GeoLocation,
  climateData: ClimateDataResponse,
  classification: ClassificationResponse,
  lang: string,
  t: any
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297mm
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = 15;

  // --- 1. Header Section ---
  const latStr = `${Math.abs(location.lat).toFixed(4)}°${location.lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(location.lng).toFixed(4)}°${location.lng >= 0 ? 'E' : 'W'}`;
  const mainClass = classification.data.find(c => c.type === 'K\u00f6ppen-Geiger' && c.text) || classification.data[0];
  
  let classText = mainClass?.text;
  if (lang === 'zh' && mainClass?.code) {
    const cnText = getChineseClimateClassification(mainClass.code);
    if (cnText) classText = cnText;
  }
  classText = classText || (lang === 'zh' ? '未知气候' : 'Unknown');

  const headerHtml = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid black; padding-bottom: 10px;">
        ${t.reportTitle}
      </h1>
      <div style="font-size: 14px; line-height: 1.6;">
        <p style="margin: 5px 0;"><strong>${t.generatedOn}:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin: 5px 0;"><strong>${t.selectedLocation}:</strong> ${latStr}, ${lngStr}</p>
        <p style="margin: 5px 0;"><strong>${t.code}:</strong> ${mainClass?.code || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>${t.basedOn}:</strong> ${classText}</p>
      </div>
    </div>
  `;

  try {
    const headerImg = await renderHtmlToImage(headerHtml);
    const headerPdfHeight = (headerImg.height / headerImg.width) * contentWidth; // Maintain aspect ratio
    
    doc.addImage(headerImg.dataUrl, 'PNG', margin, currentY, contentWidth, headerPdfHeight);
    currentY += headerPdfHeight + 5;
  } catch (e) {
    console.error("Header generation failed", e);
  }

  // --- 2. Chart Section ---
  const chartElement = document.getElementById('climate-chart-container');
  if (chartElement) {
    try {
      // Capture chart with specific options to handle transparency/colors
      const chartCanvas = await html2canvas(chartElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff' // Force white bg
      });
      
      const chartImgData = chartCanvas.toDataURL('image/png');
      const chartPdfHeight = (chartCanvas.height / chartCanvas.width) * contentWidth;
      
      // Check for page break
      if (currentY + chartPdfHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }

      doc.addImage(chartImgData, 'PNG', margin, currentY, contentWidth, chartPdfHeight);
      currentY += chartPdfHeight + 10;
    } catch (e) {
      console.error("Chart capture failed", e);
    }
  }

  // --- 3. Table Section ---
  // Reconstruct table HTML to be clean and B&W
  const tableRows = climateData.data.map((d) => `
    <tr style="border-bottom: 1px solid #000;">
      <td style="padding: 8px; text-align: left;">${t.months[d.month - 1]}</td>
      <td style="padding: 8px; text-align: right;">${d.temp.toFixed(1)}</td>
      <td style="padding: 8px; text-align: right;">${d.prec.toFixed(1)}</td>
    </tr>
  `).join('');

  const tableHtml = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">${t.monthlyBreakdown}</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #000;">
        <thead style="background-color: #f0f0f0;">
          <tr>
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #000;">${t.month}</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #000;">${t.temp} (°C)</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #000;">${t.precip} (mm)</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;

  try {
    const tableImg = await renderHtmlToImage(tableHtml);
    const tablePdfHeight = (tableImg.height / tableImg.width) * contentWidth;

    // Check for page break
    if (currentY + tablePdfHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    doc.addImage(tableImg.dataUrl, 'PNG', margin, currentY, contentWidth, tablePdfHeight);
  } catch (e) {
    console.error("Table generation failed", e);
  }

  // Save
  doc.save(`Climate_Report_${location.lat.toFixed(2)}_${location.lng.toFixed(2)}.pdf`);
};