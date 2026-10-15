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
  try {
    const pdf = await buildInvoiceJsPDF(elementId);
    // autoPrint embeds the print dialog action directly into the PDF
    pdf.autoPrint();
    const rawUrl = pdf.output("bloburl");
    const blobUrl = typeof rawUrl === "string" ? rawUrl : String(rawUrl);

    // Open the clean PDF viewer in a new tab without popup blocker conflicts
    const printTab = window.open(blobUrl, "_blank");
    if (!printTab) {
      // If browser blocked new tab, open in a hidden iframe and print
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 300);
      };
    }
  } catch (err) {
    console.error("Print error:", err);
    // Fallback to standard window.print() if canvas creation encounters issue
    window.print();
  }
}

