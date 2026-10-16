import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface QuotationItem {
  id?: string;
  serialNumber?: number;
  section?: string | null;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface QuotationData {
  quotationNumber?: string;
  date?: string | Date;
  status?: string;
  subtotal: number;
  discount: number;
  tax?: number;
  total: number;
  notes?: string | null;
  items: QuotationItem[];
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

interface QuotationPDFTemplateProps {
  quotation: QuotationData;
  settings?: SettingsData;
  id?: string;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fcfdfe",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const labelCls = "text-[8px] font-extrabold uppercase tracking-[0.18em] mb-1.5";

function statusBadge(status?: string) {
  switch (status) {
    case "Accepted":
      return { bg: "#dcfce7", text: "#15803d", border: "#86efac" };
    case "Converted":
      return { bg: "#f3e8ff", text: "#7e22ce", border: "#d8b4fe" };
    case "Rejected":
      return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
    case "Sent":
      return { bg: "#e0e7ff", text: "#4338ca", border: "#a5b4fc" };
    default:
      return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  }
}

export const QuotationPDFTemplate: React.FC<QuotationPDFTemplateProps> = ({
  quotation,
  settings,
  id = "quotation-pdf-template",
}) => {
  const currency = settings?.currency || "PKR";
  const badgeColors = statusBadge(quotation.status);

  // Group line items by section, running serial across section breaks.
  const groupedSections: {
    sectionTitle: string | null;
    items: { item: QuotationItem; seq: number }[];
  }[] = [];
  let currentSection: string | null = null;
  let currentItems: { item: QuotationItem; seq: number }[] = [];
  let runningSeq = 0;

  const pushCurrent = () => {
    if (currentItems.length > 0) {
      groupedSections.push({ sectionTitle: currentSection, items: currentItems });
    }
  };

  quotation.items.forEach((item) => {
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
      {/* 1. Top Header */}
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
              Commercial Quotation
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

      {/* 2. Hero Section */}
      <div className="flex items-center justify-between gap-4 mt-3 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1
              className="font-black uppercase text-slate-900 tracking-[0.06em]"
              style={{ fontSize: "23px", lineHeight: 1 }}
            >
              Quotation
            </h1>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em]"
              style={{
                backgroundColor: badgeColors.bg,
                color: badgeColors.text,
                border: `1px solid ${badgeColors.border}`,
              }}
            >
              ● {quotation.status || "Draft"}
            </span>
          </div>
          <p className="text-[8.5px] text-slate-400 uppercase tracking-[0.16em] font-bold mt-1">
            Official Price Estimate &amp; Proposal
          </p>
        </div>

        {/* Quotation Number & Date Badge */}
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
              Quotation No
            </p>
            <p className="font-mono font-black text-slate-900 text-[15px] leading-tight mt-0.5 tracking-tight">
              {quotation.quotationNumber || "QT-NEW"}
            </p>
          </div>
          <div className="pl-3 text-left">
            <p className="text-[7.5px] uppercase tracking-[0.18em] font-extrabold text-slate-400">
              Issue Date
            </p>
            <p className="font-semibold text-slate-800 text-[11px] leading-tight mt-0.5">
              {formatDate(quotation.date)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Customer & Proposal Meta Details Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2.5">
        <div style={cardStyle} className="p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className={labelCls} style={{ color: "#1e40af" }}>
                Prepared For
              </p>
              {quotation.customer?.customerCode && (
                <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {quotation.customer.customerCode}
                </span>
              )}
            </div>
            <p className="text-[13px] font-extrabold text-slate-900 leading-snug">
              {quotation.customer?.name || "WALK-IN CUSTOMER"}
            </p>
            {quotation.customer?.companyName && (
              <p className="text-[10.5px] font-bold text-slate-700 mt-0.5">
                {quotation.customer.companyName}
              </p>
            )}
            <p className="text-[9.5px] text-slate-500 mt-1 leading-[1.45]">
              {quotation.customer?.address || "Address: Walk-in / Direct Client"}
              {quotation.customer?.city ? `, ${quotation.customer.city}` : ""}
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 text-[9.5px] text-slate-700">
            {quotation.customer?.phone && (
              <span>
                <strong className="font-semibold text-slate-900">Phone:</strong> {quotation.customer.phone}
              </span>
            )}
            {quotation.customer?.email && (
              <span>
                <strong className="font-semibold text-slate-900">Email:</strong> {quotation.customer.email}
              </span>
            )}
          </div>
        </div>

        <div style={cardStyle} className="p-3">
          <p className={labelCls} style={{ color: "#1e40af" }}>
            Proposal Details
          </p>

          <div className="text-[9.5px] divide-y divide-slate-100 mt-1">
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">Quotation Date</span>
              <span className="font-bold text-slate-800">
                {formatDate(quotation.date)}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">Client Reference</span>
              <span className="font-bold text-slate-800 font-mono">
                {quotation.customer?.customerCode || "WALK-IN"}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Validity Period</span>
              <span className="font-bold text-blue-700">
                7 Days from Issue
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Current Status</span>
              <span className="font-bold text-slate-800">
                {quotation.status || "Draft"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Line items table */}
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
              <th className="py-2 px-3 font-extrabold">Proposed Item / Scope</th>
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
                  No items in proposal
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

      {/* 5. Bottom Split: Terms & Signatures + Totals */}
      <div className="grid grid-cols-12 gap-3 mt-3 flex-1 items-start">
        <div className="col-span-7 flex flex-col justify-between h-full">
          <div>
            <div style={cardStyle} className="p-3">
              <p className={labelCls} style={{ color: "#1e40af" }}>
                Terms of Proposal &amp; Conditions
              </p>
              <p className="text-slate-600 text-[9.5px] leading-[1.5] whitespace-pre-wrap">
                {quotation.notes ||
                  settings?.defaultNotes ||
                  "1. Quoted prices are valid for 7 days from issue.\n2. Delivery & completion timeline commences upon receipt of advance order confirmation.\n3. Goods remain the property of Dani Brothers until fully invoiced and settled."}
              </p>
            </div>
          </div>

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
                    Prepared By
                  </p>
                </div>
              </div>

              <div className="w-36 text-center">
                <div style={{ borderTop: "1.5px solid #cbd5e1" }} className="pt-1.5">
                  <p className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-slate-700">
                    Client Approval
                  </p>
                  <p className="text-[7.5px] text-slate-400 uppercase tracking-wider">
                    Authorized Acceptance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                    {formatCurrency(quotation.subtotal, currency)}
                  </td>
                </tr>

                {quotation.discount > 0 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#fff1f2" }}>
                    <td className="py-1.5 px-3 text-rose-700 font-semibold">Special Discount</td>
                    <td
                      className="py-1.5 px-3 text-right font-extrabold text-rose-700"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      - {formatCurrency(quotation.discount, currency)}
                    </td>
                  </tr>
                )}

                {(quotation.tax ?? 0) > 0 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="py-1.5 px-3 text-slate-500 font-medium">Estimated Tax / GST</td>
                    <td
                      className="py-1.5 px-3 text-right font-semibold text-slate-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      + {formatCurrency(quotation.tax || 0, currency)}
                    </td>
                  </tr>
                )}

                <tr
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#ffffff",
                  }}
                >
                  <td className="py-2.5 px-3 uppercase tracking-[0.1em] text-[9.5px] font-extrabold">
                    Total Estimate
                  </td>
                  <td
                    className="py-2.5 px-3 text-right font-black text-[14px]"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatCurrency(quotation.total, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[8px] text-slate-400 mt-1.5 text-right uppercase tracking-[0.14em] font-bold">
            Amounts shown in {currency}
          </p>
        </div>
      </div>

      {/* 6. Footer */}
      <footer
        className="mt-3 pt-2 text-center text-[8.5px] leading-relaxed text-slate-400"
        style={{ borderTop: "1px solid #f1f5f9" }}
      >
        <p>
          {settings?.footerText || "This is a computer-generated quotation."}
        </p>
        <p className="text-[7.5px] text-slate-300 mt-0.5 tracking-wider uppercase">
          Generated via Dani Brothers Billing System
        </p>
      </footer>
    </div>
  );
};
