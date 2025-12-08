import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PAPER_SIZES } from './templateDefaults';

/**
 * Export flyer canvas to PDF
 * @param {HTMLElement} element - The canvas element to export
 * @param {Object} options - Export options
 * @returns {Promise<void>}
 */
export async function exportToPDF(element, options = {}) {
  const {
    fileName = 'folleto-menu.pdf',
    paperSize = 'A4',
    orientation = 'portrait',
    quality = 2,
  } = options;

  try {
    // Get paper dimensions
    const paper = PAPER_SIZES[paperSize];
    if (!paper) {
      throw new Error(`Tamaño de papel no soportado: ${paperSize}`);
    }

    // Canvas rendering options
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: paper.pxWidth,
      height: paper.pxHeight,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: paperSize.toLowerCase(),
      compress: true,
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Add image to PDF
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      paper.width,
      paper.height,
      undefined,
      'FAST'
    );

    // Save PDF
    pdf.save(fileName);

    return { success: true };
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
}

/**
 * Export flyer canvas to image (PNG/JPEG)
 * @param {HTMLElement} element - The canvas element to export
 * @param {Object} options - Export options
 * @returns {Promise<void>}
 */
export async function exportToImage(element, options = {}) {
  const {
    fileName = 'folleto-menu.png',
    format = 'png',
    quality = 2,
    paperSize = 'A4',
  } = options;

  try {
    const paper = PAPER_SIZES[paperSize];
    
    // Get the actual element dimensions
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    
    // Calculate the scale factor to reach target dimensions
    // For IG formats, we want to export at full resolution (1080px width)
    const targetWidth = paper.pxWidth;
    const targetHeight = paper.pxHeight;
    const scaleX = targetWidth / elementWidth;
    const scaleY = targetHeight / elementHeight;
    const scaleFactor = Math.max(scaleX, scaleY);

    const canvas = await html2canvas(element, {
      scale: scaleFactor * quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // If the canvas is larger than needed, we might need to resize it
    // Create a new canvas with exact target dimensions
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;
    const ctx = finalCanvas.getContext('2d');
    
    // Draw the scaled canvas onto the final canvas
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

    // Convert to blob and download
    finalCanvas.toBlob(
      (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      },
      `image/${format}`,
      0.95
    );

    return { success: true };
  } catch (error) {
    console.error('Error al exportar imagen:', error);
    throw new Error(`Error al generar imagen: ${error.message}`);
  }
}

export async function exportMultipleToPDF(elements, options = {}) {
  const {
    fileName = 'menu.pdf',
    paperSize = 'A4',
    orientation = 'portrait',
    quality = 2,
  } = options;

  const paper = PAPER_SIZES[paperSize];
  if (!paper) throw new Error(`Tamaño de papel no soportado: ${paperSize}`);

  const pdf = new jsPDF({ orientation, unit: 'mm', format: paperSize.toLowerCase(), compress: true });

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el) continue;
    const canvas = await html2canvas(el, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: paper.pxWidth,
      height: paper.pxHeight,
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, paper.width, paper.height, undefined, 'FAST');
  }

  pdf.save(fileName);
  return { success: true };
}

/**
 * Preview PDF in new window
 * @param {HTMLElement} element - The canvas element to preview
 * @param {Object} options - Preview options
 * @returns {Promise<void>}
 */
export async function previewPDF(element, options = {}) {
  const {
    paperSize = 'A4',
    orientation = 'portrait',
    quality = 2,
  } = options;

  try {
    const paper = PAPER_SIZES[paperSize];

    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: paper.pxWidth,
      height: paper.pxHeight,
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: paperSize.toLowerCase(),
      compress: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, paper.width, paper.height);

    // Open in new window
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    return { success: true };
  } catch (error) {
    console.error('Error al previsualizar PDF:', error);
    throw new Error(`Error al previsualizar PDF: ${error.message}`);
  }
}

/**
 * Validate element for PDF export
 * @param {HTMLElement} element - The element to validate
 * @returns {Object} Validation result
 */
export function validateForExport(element) {
  const errors = [];
  const warnings = [];

  if (!element) {
    errors.push('No se encontró el elemento para exportar');
    return { valid: false, errors, warnings };
  }

  // Check dimensions
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    errors.push('El elemento tiene dimensiones inválidas');
  }

  // Check for images
  const images = element.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.complete) {
      warnings.push(`Imagen ${index + 1} aún no ha cargado completamente`);
    }
    if (!img.src || img.src.includes('data:image')) {
      // Data URLs are OK
    } else if (!img.crossOrigin) {
      warnings.push(`Imagen ${index + 1} puede tener problemas de CORS`);
    }
  });

  // Check for external fonts
  const hasExternalFonts = document.fonts?.status === 'loading';
  if (hasExternalFonts) {
    warnings.push('Las fuentes externas están cargando. Espere un momento.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get estimated file size
 * @param {HTMLElement} element - The element to estimate
 * @returns {Promise<number>} Estimated size in bytes
 */
export async function estimateFileSize(element, options = {}) {
  try {
    const paper = PAPER_SIZES[options.paperSize || 'A4'];
    const canvas = await html2canvas(element, {
      scale: 1, // Low quality for estimation
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: paper.pxWidth,
      height: paper.pxHeight,
    });

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob.size * (options.quality || 2)); // Estimate based on quality
        },
        'image/jpeg',
        0.95
      );
    });
  } catch (error) {
    console.error('Error estimando tamaño:', error);
    return 0;
  }
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
