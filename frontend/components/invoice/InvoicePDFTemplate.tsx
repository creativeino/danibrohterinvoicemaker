import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceItem {
  id?: string;
  serialNumber?: number;
  section?: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string | Date;
  dueDate?: string | Date | null;
  quotationNumber?: string | null;
  quotationId?: string | null;
  referenceNumber?: string | null;
  status?: string;
  subtotal: number;
  discount: number;
  additionalCharges?: number;
  tax?: number;
  total: number;
  advance: number;
  paidAmount?: number;
  balance: number;
  notes?: string | null;
  items: InvoiceItem[];
  payments?: {
    id: string;
    paymentNumber: string;
    paymentDate: string | Date;
    paymentMethod: string;
    reference?: string | null;
    amount: number;
  }[];
  customer?: {
    name: string;
    customerCode?: string;
    companyName?: string | null;
    address: string;
    city: string;
    phone: string;
    email?: string | null;
  } | null;
}

interface SettingsData {
  businessName?: string;
  logo?: string | null;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string | null;
  ntn?: string | null;
  strn?: string | null;
  currency?: string;
  defaultNotes?: string | null;
  footerText?: string | null;
}

interface InvoicePDFTemplateProps {
  invoice: InvoiceData;
  settings?: SettingsData;
  id?: string;
}

// Shared card chrome for the modern layout: soft fill, hairline border,
// rounded corners. Inline styles only — html2canvas-safe colors (plain hex,
// no Tailwind lab()/color-mix() vars, no opacity modifiers).
// Shared card chrome for the modern layout: soft fill, hairline border,
// rounded corners. Inline styles only — html2canvas-safe colors (plain hex,
// no Tailwind lab()/color-mix() vars, no opacity modifiers).
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fcfdfe",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

// Small uppercase eyebrow label used at the top of cards & sections.
const labelCls = "text-[8px] font-extrabold uppercase tracking-[0.18em] mb-1.5";

export const InvoicePDFTemplate: React.FC<InvoicePDFTemplateProps> = ({
  invoice,
  settings,
  id = "invoice-pdf-template",
}) => {
  const currency = settings?.currency || "PKR";
  const isPaid = (invoice.balance <= 0 || invoice.status === "Paid");
  const isPartial = (invoice.paidAmount ?? 0) > 0 && !isPaid;

  // Group line items by section if present, maintaining order.
  const groupedSections: {
    sectionTitle: string | null;
    items: { item: InvoiceItem; seq: number }[];
  }[] = [];
  let currentSection: string | null = null;
  let currentItems: { item: InvoiceItem; seq: number }[] = [];
  let runningSeq = 0;

  const pushCurrent = () => {
    if (currentItems.length > 0) {
      groupedSections.push({ sectionTitle: currentSection, items: currentItems });
    }
  };

  invoice.items.forEach((item) => {
    const itemSection = item.section?.trim() || null;
    if (itemSection !== currentSection) {
      pushCurrent();
      currentSection = itemSection;
      currentItems = [];
    }
    runningSeq += 1;
    currentItems.push({ item, seq: runningSeq });
  });
  pushCurrent();

  const hasQuotation = Boolean(invoice.quotationNumber || invoice.quotationId);

  return (
    <div
      id={id}
      className="bg-white text-slate-900 font-sans"
      style={{
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        padding: "8mm 11mm",
        borderTop: "4mm solid #1e40af",
        display: "flex",
        flexDirection: "column",
        lineHeight: 1.4,
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      }}
    >
      {/* 1. Top Header: Company logo & brand on left, verified company details on right */}
      <header
        className="flex items-start justify-between gap-6 pb-3"
        style={{ borderBottom: "1.5px solid #f1f5f9" }}
      >
        <div className="flex flex-col items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings?.logo || "/logodanibro.svg"}
            alt={settings?.businessName || "Company logo"}
            style={{ maxHeight: "46px", width: "auto", objectFit: "contain" }}
          />
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="inline-block px-1.5 py-0.5 rounded text-[7.5px] font-bold tracking-[0.14em] uppercase"
              style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
            >
              Tax Invoice &amp; Billing
            </span>
            {(settings?.ntn || settings?.strn) && (
              <span className="text-[8px] font-medium text-slate-400">
                {settings.ntn && `NTN: ${settings.ntn}`}
                {settings.ntn && settings.strn && " · "}
                {settings.strn && `STRN: ${settings.strn}`}
              </span>
            )}
          </div>
        </div>

        <div className="text-right text-[9px] text-slate-500 leading-[1.5]">
          <p className="font-extrabold text-slate-900 text-[13px] tracking-tight">
            {settings?.businessName || "DANI BROTHERS"}
          </p>
          <p className="text-slate-600 font-medium">
            {settings?.address || "Shop B-13 Sector Z-6 Gulshan e Maymar"},{" "}
            {settings?.city || "Sindh, Karachi"}
          </p>
          <p className="mt-0.5">
            <span className="font-semibold text-slate-700">Tel:</span>{" "}
            {settings?.phone || "0333 1360441"}
            <span className="mx-1 text-slate-300">|</span>
            <span className="font-semibold text-slate-700">Email:</span>{" "}
            {settings?.email || "danibrothers99@gmail.com"}
          </p>
          {settings?.website && (
            <p>
              <span className="font-semibold text-slate-700">Web:</span>{" "}
              {settings.website}
            </p>
          )}
        </div>
      </header>

      {/* 2. Hero Section: Document title, Status Badge & High-Contrast Number Chip */}
      <div className="flex items-center justify-between gap-4 mt-3 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="font-black uppercase text-slate-900 tracking-[0.06em]"
              style={{ fontSize: "23px", lineHeight: 1 }}
            >
              Invoice
            </h1>
            {/* Status Stamp / Badge */}
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em]"
              style={{
                backgroundColor: isPaid
                  ? "#dcfce7"
                  : isPartial
                  ? "#fef3c7"
                  : invoice.status === "Overdue" || invoice.status === "Cancelled"
                  ? "#fee2e2"
                  : "#eff6ff",
                color: isPaid
                  ? "#15803d"
                  : isPartial
                  ? "#b45309"
                  : invoice.status === "Overdue" || invoice.status === "Cancelled"
                  ? "#b91c1c"
                  : "#1d4ed8",
                border: `1px solid ${
                  isPaid
                    ? "#86efac"
                    : isPartial
                    ? "#fcd34d"
                    : invoice.status === "Overdue" || invoice.status === "Cancelled"
                    ? "#fca5a5"
                    : "#bfdbfe"
                }`,
              }}
            >
              ● {invoice.status || (isPaid ? "Paid" : "Issued")}
            </span>
          </div>
          <p className="text-[8.5px] text-slate-400 uppercase tracking-[0.16em] font-bold mt-1">
            Original Commercial Copy
          </p>
        </div>

        {/* Invoice Number & Date Badge */}
        <div
          className="flex items-center divide-x divide-slate-200 px-3.5 py-2"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
          }}
        >
          <div className="pr-3 text-right">
            <p className="text-[7.5px] uppercase tracking-[0.18em] font-extrabold text-slate-400">
              Invoice No
            </p>
            <p className="font-mono font-black text-slate-900 text-[15px] leading-tight mt-0.5 tracking-tight">
              {invoice.invoiceNumber || "INV-NEW"}
            </p>
          </div>
          <div className="pl-3 text-left">
            <p className="text-[7.5px] uppercase tracking-[0.18em] font-extrabold text-slate-400">
              Issue Date
            </p>
            <p className="font-semibold text-slate-800 text-[11px] leading-tight mt-0.5">
              {formatDate(invoice.invoiceDate)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Customer & Meta Details Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2.5">
        {/* Customer Card */}
        <div style={cardStyle} className="p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className={labelCls} style={{ color: "#1e40af" }}>
                Billed To
              </p>
              {invoice.customer?.customerCode && (
                <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {invoice.customer.customerCode}
                </span>
              )}
            </div>
            <p className="text-[13px] font-extrabold text-slate-900 leading-snug">
              {invoice.customer?.name || "WALK-IN CUSTOMER"}
            </p>
            {invoice.customer?.companyName && (
              <p className="text-[10.5px] font-bold text-slate-700 mt-0.5">
                {invoice.customer.companyName}
              </p>
            )}
            <p className="text-[9.5px] text-slate-500 mt-1 leading-[1.45]">
              {invoice.customer?.address || "Address: Walk-in / Direct Sales"}
              {invoice.customer?.city ? `, ${invoice.customer.city}` : ""}
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 text-[9.5px] text-slate-700">
            {invoice.customer?.phone && (
              <span>
                <strong className="font-semibold text-slate-900">Phone:</strong> {invoice.customer.phone}
              </span>
            )}
            {invoice.customer?.email && (
              <span>
                <strong className="font-semibold text-slate-900">Email:</strong> {invoice.customer.email}
              </span>
            )}
          </div>
        </div>

        {/* Invoice Meta Card */}
        <div style={cardStyle} className="p-3">
          <p className={labelCls} style={{ color: "#1e40af" }}>
            Invoice Details
          </p>

          <div className="text-[9.5px] divide-y divide-slate-100 mt-1">
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">Invoice Date</span>
              <span className="font-bold text-slate-800">
                {formatDate(invoice.invoiceDate)}
              </span>
            </div>

            {invoice.dueDate && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Payment Due Date</span>
                <span className="font-bold text-slate-800">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
            )}

            {hasQuotation && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Quotation Reference</span>
                <span className="font-bold text-indigo-700 font-mono">
                  {invoice.quotationNumber || invoice.quotationId}
                </span>
              </div>
            )}

            {invoice.referenceNumber && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Purchase Order / Ref</span>
                <span className="font-bold text-slate-800 font-mono">
                  {invoice.referenceNumber}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Payment Method / Status</span>
              <span className="font-bold text-slate-800">
                {isPaid ? "Fully Settled" : isPartial ? "Partially Paid" : "Unpaid / Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Line items table with refined executive design */}
      <div
        className="mt-3"
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <table className="w-full text-left border-collapse" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr
              className="text-white text-[8.5px] uppercase tracking-[0.12em]"
              style={{ backgroundColor: "#1e293b" }}
            >
              <th
                className="py-2 px-2.5 text-center font-extrabold"
                style={{ width: "12mm" }}
              >
                #
              </th>
              <th
                className="py-2 px-2.5 text-center font-extrabold"
                style={{ width: "15mm" }}
              >
                Qty
              </th>
              <th className="py-2 px-3 font-extrabold">Item Description</th>
              <th
                className="py-2 px-3 text-right font-extrabold"
                style={{ width: "32mm" }}
              >
                Rate ({currency})
              </th>
              <th
                className="py-2 px-3 text-right font-extrabold"
                style={{ width: "36mm" }}
              >
                Amount ({currency})
              </th>
            </tr>
          </thead>
          <tbody className="text-[10px]">
            {groupedSections.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-slate-400 border-b border-slate-100"
                >
                  No line items listed
                </td>
              </tr>
            )}

            {groupedSections.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                {group.sectionTitle && (
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <td
                      colSpan={5}
                      className="py-1 px-3 font-extrabold uppercase tracking-[0.14em] text-[8.5px]"
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        borderTop: gIdx > 0 ? "1px solid #e2e8f0" : "none",
                        color: "#1e40af",
                      }}
                    >
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 align-middle" />
                      {group.sectionTitle}
                    </td>
                  </tr>
                )}
                {group.items.map(({ item, seq }, iIdx) => (
                  <tr
                    key={item.id || `${gIdx}-${iIdx}`}
                    style={{
                      backgroundColor: iIdx % 2 === 1 ? "#fafcfd" : "#ffffff",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <td className="py-2 px-2.5 text-center text-slate-400 font-semibold align-top text-[9.5px]">
                      {String(seq).padStart(2, "0")}
                    </td>
                    <td
                      className="py-2 px-2.5 text-center font-extrabold text-slate-900 align-top"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {item.quantity}
                    </td>
                    <td className="py-2 px-3 text-slate-800 align-top pr-4">
                      <p className="font-bold text-slate-900 leading-snug">
                        {item.description.split("\n")[0]}
                      </p>
                      {item.description.includes("\n") && (
                        <p className="text-[9px] text-slate-500 mt-0.5 whitespace-pre-wrap leading-normal font-normal">
                          {item.description.split("\n").slice(1).join("\n")}
                        </p>
                      )}
                    </td>
                    <td
                      className="py-2 px-3 text-right font-medium text-slate-600 align-top"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {item.rate.toLocaleString("en-PK")}
                    </td>
                    <td
                      className="py-2 px-3 text-right font-bold text-slate-900 align-top"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {item.amount.toLocaleString("en-PK")}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Bottom Split: Terms & Signatures (Left) + Totals Summary (Right) */}
      <div className="grid grid-cols-12 gap-3 mt-3 flex-1 items-start">
        {/* Left Column: Notes & Trail */}
        <div className="col-span-7 flex flex-col justify-between h-full">
          <div>
            <div style={cardStyle} className="p-3">
              <p className={labelCls} style={{ color: "#1e40af" }}>
                Terms &amp; Important Notes
              </p>
              <p className="text-slate-600 text-[9.5px] leading-[1.5] whitespace-pre-wrap">
                {invoice.notes ||
                  settings?.defaultNotes ||
                  "Thank you for choosing Dani Brothers. All equipment carries 1 Year standard manufacturer warranty. Physical damage, electrical surge or burns are strictly void."}
              </p>
            </div>

            {/* Payment History Log (if payments exist) */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div
                className="p-2.5 mt-2 rounded-lg"
                style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
              >
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-200">
                  <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-emerald-800">
                    Payment Receipts ({invoice.payments.length})
                  </span>
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest">
                    Settlement Trail
                  </span>
                </div>
                <div className="space-y-1 text-[8.5px]">
                  {invoice.payments.map((p, pIdx) => (
                    <div
                      key={p.id || pIdx}
                      className="flex justify-between items-center text-slate-600"
                    >
                      <span>
                        <strong className="font-mono text-slate-800 font-bold">{p.paymentNumber}</strong>
                        {" · "}
                        {formatDate(p.paymentDate)}
                        {" ("}
                        {p.paymentMethod}
                        {p.reference ? ` - ${p.reference}` : ""}
                        {")"}
                      </span>
                      <span className="font-extrabold text-emerald-700 font-mono">
                        {formatCurrency(p.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dual Signatures */}
          <div className="pt-6 mt-auto">
            <div className="flex justify-between items-end gap-6">
              <div className="w-40 text-center flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings?.logo || "/logodanibro.svg"}
                  alt="Company stamp/logo"
                  style={{ maxHeight: "24px", width: "auto", objectFit: "contain", marginBottom: "4px" }}
                />
                <div style={{ borderTop: "1.5px solid #cbd5e1", width: "100%" }} className="pt-1.5">
                  <p className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-slate-700">
                    Dani Brothers
                  </p>
                  <p className="text-[7.5px] text-slate-400 uppercase tracking-wider">
                    Authorized Signatory
                  </p>
                </div>
              </div>

              <div className="w-36 text-center">
                <div style={{ borderTop: "1.5px solid #cbd5e1" }} className="pt-1.5">
                  <p className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-slate-700">
                    Received By
                  </p>
                  <p className="text-[7.5px] text-slate-400 uppercase tracking-wider">
                    Customer Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Calculations Card */}
        <div className="col-span-5">
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}
          >
            <table className="w-full border-collapse text-[10px]">
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td className="py-1.5 px-3 text-slate-500 font-medium">Subtotal</td>
                  <td
                    className="py-1.5 px-3 text-right font-bold text-slate-800"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatCurrency(invoice.subtotal, currency)}
                  </td>
                </tr>

                {invoice.discount > 0 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#fff1f2" }}>
                    <td className="py-1.5 px-3 text-rose-700 font-semibold">Special Discount</td>
                    <td
                      className="py-1.5 px-3 text-right font-extrabold text-rose-700"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      - {formatCurrency(invoice.discount, currency)}
                    </td>
                  </tr>
                )}

                {(invoice.additionalCharges ?? 0) > 0 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="py-1.5 px-3 text-slate-500 font-medium">Charges / Adjustment</td>
                    <td
                      className="py-1.5 px-3 text-right font-semibold text-slate-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      + {formatCurrency(invoice.additionalCharges || 0, currency)}
                    </td>
                  </tr>
                )}

                {(invoice.tax ?? 0) > 0 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="py-1.5 px-3 text-slate-500 font-medium">Tax / GST</td>
                    <td
                      className="py-1.5 px-3 text-right font-semibold text-slate-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      + {formatCurrency(invoice.tax || 0, currency)}
                    </td>
                  </tr>
                )}

                {/* Grand Total */}
                <tr style={{ backgroundColor: "#1e293b", color: "#ffffff" }}>
                  <td className="py-2 px-3 uppercase tracking-[0.1em] text-[9px] font-extrabold">
                    Grand Total
                  </td>
                  <td
                    className="py-2 px-3 text-right font-black text-[13.5px]"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatCurrency(invoice.total, currency)}
                  </td>
                </tr>

                {/* Advance Received */}
                {invoice.advance > 0 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#f0fdf4" }}>
                    <td className="py-1.5 px-3 text-emerald-800 font-semibold">Advance Payment</td>
                    <td
                      className="py-1.5 px-3 text-right font-extrabold text-emerald-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      - {formatCurrency(invoice.advance, currency)}
                    </td>
                  </tr>
                )}

                {/* Subsequent / Total Payments */}
                {(invoice.paidAmount ?? 0) > (invoice.advance || 0) && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#f0fdf4" }}>
                    <td className="py-1.5 px-3 text-emerald-800 font-semibold">
                      {invoice.advance > 0 ? "Further Payments" : "Total Paid"}
                    </td>
                    <td
                      className="py-1.5 px-3 text-right font-extrabold text-emerald-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      - {formatCurrency((invoice.paidAmount ?? 0) - (invoice.advance || 0), currency)}
                    </td>
                  </tr>
                )}

                {/* Balance Due / Paid In Full Callout */}
                <tr
                  style={{
                    backgroundColor: isPaid ? "#ecfdf5" : "#eff6ff",
                    borderTop: "2px solid #e2e8f0",
                  }}
                >
                  <td
                    className="py-2.5 px-3 font-extrabold uppercase text-[9.5px] tracking-[0.08em]"
                    style={{ color: isPaid ? "#047857" : "#1d4ed8" }}
                  >
                    {isPaid ? "Status: PAID IN FULL" : "Balance Due"}
                  </td>
                  <td
                    className="py-2.5 px-3 text-right font-black text-[14px]"
                    style={{
                      color: isPaid ? "#047857" : "#1d4ed8",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCurrency(invoice.balance <= 0 ? 0 : invoice.balance, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[8px] text-slate-400 mt-1.5 text-right uppercase tracking-[0.14em] font-bold">
            All amounts in {currency}
          </p>
        </div>
      </div>

      {/* 6. Clean Corporate Footer */}
      <footer
        className="mt-3 pt-2 text-center text-[8.5px] leading-relaxed text-slate-400"
        style={{ borderTop: "1px solid #f1f5f9" }}
      >
        <p>
          {settings?.footerText || "This is a computer-generated commercial invoice. No signature required if electronically transmitted."}
        </p>
        <p className="text-[7.5px] text-slate-300 mt-0.5 tracking-wider uppercase">
          Generated via Dani Brothers Billing System
        </p>
      </footer>
    </div>
  );
};

