import jsPDF from "jspdf";
import html2canvas from "html2canvas";

async function buildInvoiceJsPDF(elementId: string): Promise<jsPDF> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found.`);
  }

  // Make sure webfonts are fully loaded before rasterizing
  try {
    await document.fonts.ready;
  } catch {
    // Older browsers without the CSS Font Loading API — render anyway.
  }

  const holder = document.createElement("div");
  holder.style.cssText =
    "position:fixed; left:-20000px; top:0; width:210mm; background:#ffffff; pointer-events:none; z-index:-9999;";
  const clone = element.cloneNode(true) as HTMLElement;
  // Reset any zoom styling on the clone so html2canvas renders at full 100% A4 size
  clone.style.zoom = "1";
  clone.style.transform = "none";
  clone.style.margin = "0";
  holder.appendChild(clone);
  document.body.appendChild(holder);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(clone, {
      scale: 2, // 2x scale for crystal clear crisp fonts and borders
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: clone.scrollWidth || 794,
      windowWidth: 1200,
    });
  } finally {
    holder.remove();
  }

  const imgData = canvas.toDataURL("image/png");

  // Standard A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  let page = 1;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pdfHeight;

  // Multi-page automatic continuation if height exceeds 1 page.
  while (heightLeft > 1) {
    position = -(page * pdfHeight);
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pdfHeight;
    page++;
  }

  return pdf;
}

export async function generateInvoicePDF(elementId: string, filename: string = "Invoice.pdf") {
  const pdf = await buildInvoiceJsPDF(elementId);
  pdf.save(filename);
}

export async function printInvoiceElement(elementId: string, _title: string = "Print Invoice") {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Open print window with complete cloned HTML and stylesheets
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((s) => s.outerHTML)
    .join("\n");

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${_title}</title>
        ${styles}
        <style>
          @page { size: A4 portrait; margin: 0; }
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          #${elementId} {
            margin: 0 auto !important;
            box-shadow: none !important;
          }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:center; width:100%; background:#fff;">
          ${element.outerHTML}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();

  // Print after short delay to allow images (logo) and styles to render
  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      window.print();
    }
  }, 400);
}

