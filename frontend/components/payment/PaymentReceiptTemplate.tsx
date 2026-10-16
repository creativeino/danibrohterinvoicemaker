import React from "react";
import { formatCurrency, formatDate, amountInWords } from "@/lib/utils";

export interface PaymentReceiptData {
  id?: string;
  paymentNumber: string;
  paymentDate: string | Date;
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  notes?: string | null;
  invoice: {
    id?: string;
    invoiceNumber: string;
    invoiceDate?: string | Date;
    total: number;
    paidAmount?: number;
    balance?: number;
    customer: {
      name: string;
      customerCode?: string;
      companyName?: string | null;
      address?: string;
      city?: string;
      phone?: string;
      email?: string | null;
    };
  };
}

export interface SettingsData {
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
  footerText?: string | null;
}

interface PaymentReceiptTemplateProps {
  payment: PaymentReceiptData;
  settings?: SettingsData;
  id?: string;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fcfdfe",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const labelCls = "text-[8px] font-extrabold uppercase tracking-[0.18em] mb-1.5";

export const PaymentReceiptTemplate: React.FC<PaymentReceiptTemplateProps> = ({
  payment,
  settings,
  id = "payment-receipt-template",
}) => {
  const currency = settings?.currency || "PKR";
  const inv = payment.invoice;
  const cust = inv.customer;
  const inWords = amountInWords(payment.amount);
  const isSettled = (inv.balance ?? 0) <= 0;

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
      {/* 1. Header */}
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
              Payment Acknowledgment
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
              Payment Receipt
            </h1>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.12em]"
              style={{
                backgroundColor: "#dcfce7",
                color: "#15803d",
                border: "1px solid #86efac",
              }}
            >
              ● Verified Received
            </span>
          </div>
          <p className="text-[8.5px] text-slate-400 uppercase tracking-[0.16em] font-bold mt-1">
            Official Settlement Acknowledgment
          </p>
        </div>

        {/* Receipt Number & Date Badge */}
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
              Receipt No
            </p>
            <p className="font-mono font-black text-slate-900 text-[15px] leading-tight mt-0.5 tracking-tight">
              {payment.paymentNumber}
            </p>
          </div>
          <div className="pl-3 text-left">
            <p className="text-[7.5px] uppercase tracking-[0.18em] font-extrabold text-slate-400">
              Receipt Date
            </p>
            <p className="font-semibold text-slate-800 text-[11px] leading-tight mt-0.5">
              {formatDate(payment.paymentDate)}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Cards Grid: Payer Info & Transaction Details */}
      <div className="grid grid-cols-2 gap-3 mt-2.5">
        <div style={cardStyle} className="p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className={labelCls} style={{ color: "#1e40af" }}>
                Received With Thanks From
              </p>
              {cust?.customerCode && (
                <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {cust.customerCode}
                </span>
              )}
            </div>
            <p className="text-[13px] font-extrabold text-slate-900 leading-snug">
              {cust?.name || "WALK-IN CUSTOMER"}
            </p>
            {cust?.companyName && (
              <p className="text-[10.5px] font-bold text-slate-700 mt-0.5">
                {cust.companyName}
              </p>
            )}
            <p className="text-[9.5px] text-slate-500 mt-1 leading-[1.45]">
              {cust?.address || "Address: Walk-in / Direct Client"}
              {cust?.city ? `, ${cust.city}` : ""}
            </p>
          </div>

          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-3 text-[9.5px] text-slate-700">
            {cust?.phone && (
              <span>
                <strong className="font-semibold text-slate-900">Phone:</strong> {cust.phone}
              </span>
            )}
          </div>
        </div>

        <div style={cardStyle} className="p-3">
          <p className={labelCls} style={{ color: "#1e40af" }}>
            Payment &amp; Voucher Details
          </p>

          <div className="text-[9.5px] divide-y divide-slate-100 mt-1">
            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">Receipt Date</span>
              <span className="font-bold text-slate-800">
                {formatDate(payment.paymentDate)}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">Payment Mode</span>
              <span className="font-bold text-slate-900 uppercase">
                {payment.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400 font-medium">Against Invoice #</span>
              <span className="font-mono font-extrabold text-blue-700">
                {inv.invoiceNumber}
              </span>
            </div>

            {payment.reference && (
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Bank / Txn Ref</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {payment.reference}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Highlighted Executive Amount Callout Box */}
      <div
        className="mt-3 px-4 py-3 rounded-xl flex items-center justify-between"
        style={{
          backgroundColor: "#f8fafc",
          border: "1.5px solid #1e40af",
        }}
      >
        <div>
          <span
            className="text-[8px] uppercase font-extrabold tracking-[0.18em] block"
            style={{ color: "#1e40af" }}
          >
            Net Amount Received
          </span>
          <p className="text-[11px] font-semibold text-slate-700 mt-0.5 italic">
            &ldquo;{inWords}&rdquo;
          </p>
        </div>
        <div className="text-right">
          <span
            className="text-2xl font-black font-mono tabular-nums tracking-tight"
            style={{ color: "#1e40af" }}
          >
            {formatCurrency(payment.amount, currency)}
          </span>
        </div>
      </div>

      {/* 5. Invoice Account Settlement Summary */}
      <div
        className="mt-3"
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          className="px-3 py-1.5 flex justify-between items-center text-white"
          style={{ backgroundColor: "#1e293b" }}
        >
          <span className="text-[8.5px] uppercase font-extrabold tracking-[0.12em]">
            Invoice Settlement Trail
          </span>
          <span className="text-[8.5px] font-mono text-slate-300">
            Invoice #{inv.invoiceNumber}
          </span>
        </div>
        <table className="w-full text-left border-collapse text-[10px]">
          <tbody>
            <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td className="py-2 px-3 text-slate-600 font-medium">Total Invoiced Amount</td>
              <td
                className="py-2 px-3 text-right font-bold text-slate-900 font-mono"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatCurrency(inv.total, currency)}
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#fafcfd" }}>
              <td className="py-2 px-3 text-slate-600 font-medium">Total Paid to Date (Including this Payment)</td>
              <td
                className="py-2 px-3 text-right font-bold text-emerald-800 font-mono"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatCurrency(inv.paidAmount ?? payment.amount, currency)}
              </td>
            </tr>
            <tr style={{ backgroundColor: isSettled ? "#f0fdf4" : "#eff6ff" }}>
              <td
                className="py-2 px-3 font-extrabold uppercase text-[9px] tracking-wider"
                style={{ color: isSettled ? "#15803d" : "#1d4ed8" }}
              >
                {isSettled ? "Invoice Status: PAID IN FULL" : "Remaining Outstanding Balance"}
              </td>
              <td
                className="py-2 px-3 text-right font-black font-mono text-[13px]"
                style={{
                  color: isSettled ? "#15803d" : "#1d4ed8",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatCurrency(inv.balance ?? 0, currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Notes if present */}
      {payment.notes && (
        <div style={cardStyle} className="mt-3 p-3 text-[9.5px]">
          <span className="font-extrabold uppercase tracking-[0.14em] text-slate-400 block mb-1 text-[8px]">
            Payment Memo / Note
          </span>
          <p className="text-slate-600 leading-relaxed">{payment.notes}</p>
        </div>
      )}

      {/* 7. Signatures */}
      <div className="mt-auto pt-8">
        <div className="flex justify-between items-end gap-12">
          <div className="w-48 text-center">
            <div style={{ borderTop: "1.5px solid #cbd5e1" }} className="pt-1.5">
              <p className="text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-slate-700">
                Payer Confirmation
              </p>
              <p className="text-[7.5px] text-slate-400 uppercase tracking-wider">
                Customer Signature
              </p>
            </div>
          </div>

          <div className="w-48 text-center flex flex-col items-center">
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
                Authorized Receipt Signatory
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Footer */}
      <footer
        className="mt-3 pt-2 text-center text-[8.5px] leading-relaxed text-slate-400"
        style={{ borderTop: "1px solid #f1f5f9" }}
      >
        <p>
          {settings?.footerText || "This is an official computer-generated payment voucher. Retain for tax & record purposes."}
        </p>
        <p className="text-[7.5px] text-slate-300 mt-0.5 tracking-wider uppercase">
          Generated via Dani Brothers Billing System
        </p>
      </footer>
    </div>
  );
};
