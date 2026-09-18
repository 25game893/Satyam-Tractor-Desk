import html2pdf from 'html2pdf.js';

export const downloadAsPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const opt = {
    margin: [10, 5, 10, 5] as [number, number, number, number],
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg' as const, quality: 1 },
    html2canvas: { 
      scale: 3, 
      useCORS: true, 
      logging: false,
      letterRendering: true,
      windowWidth: element.scrollWidth
    },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  try {
    // Temporarily remove 'no-print' elements if they are inside the container
    // Although our print-container usually doesn't have them inside the actual document part
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
