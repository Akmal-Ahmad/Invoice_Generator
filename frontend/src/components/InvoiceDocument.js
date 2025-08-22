import React from "react";
import { Page, Text, View, Document, Image } from "@react-pdf/renderer";
import { styles } from "./InvoiceStyles";

/** Utilities */
const safeStr = (v) => (v || v === 0 ? String(v) : "");
const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const fmtMoney = (v) => `${safeNum(v).toFixed(2)}`;
const wrapText = (text, maxLength = 25) => {
  const str = safeStr(text);
  if (str.length <= maxLength) return str;
  return str
    .split(" ")
    .map((word) =>
      word.length > maxLength
        ? word.replace(new RegExp(`(.{1,${maxLength}})`, "g"), "$1\u200B")
        : word
    )
    .join(" ");
};
const formatPaymentStatus = (status) => {
  const s = safeStr(status).toLowerCase();
  const mapping = {
    to_be_paid: "To Be Paid",
    partially_paid: "Partially Paid",
    paid: "Paid",
    unpaid: "Unpaid",
  };
  return mapping[s] || safeStr(status).replace(/_/g, " ");
};

// Updated helper for address formatting
const formatAddress = (data) => {
  const { address, city, state, postalCode, country } = data;
  const parts = [address, city, state, postalCode, country].filter(Boolean);
  return parts.join(", "); // single-line, no "Address:" prefix
};

/** Invoice Component */
export default function InvoiceDocument({
  header = {},
  billedBy = {},
  billedTo = {},
  items = [],
  payment = {},
  grandTotal = 0,
}) {
  const normalizedHeader = {
    invoiceNo: safeStr(header.invoiceNo),
    invoiceDate: safeStr(header.invoiceDate),
    logo: header.logo || "",
  };
  const normalizedBilledBy = Object.fromEntries(
    Object.entries(billedBy).map(([k, v]) => [k, safeStr(v)])
  );
  const normalizedBilledTo = Object.fromEntries(
    Object.entries(billedTo).map(([k, v]) => [k, safeStr(v)])
  );
  const normalizedPayment = {
    paymentStatus: safeStr(payment.paymentStatus).toLowerCase(),
    amountPaid: safeNum(payment.amountPaid),
    dueDate: safeStr(payment.dueDate),
  };
  const normalizedItems = Array.isArray(items) ? items : [];
  const safeGrandTotal = safeNum(grandTotal);
  let amountRemaining = safeGrandTotal - normalizedPayment.amountPaid;
  if (normalizedPayment.paymentStatus === "paid") amountRemaining = 0;
  amountRemaining = Math.max(0, safeNum(amountRemaining));

  const hasBilledBy = Object.values(normalizedBilledBy).some(Boolean);
  const hasBilledTo = Object.values(normalizedBilledTo).some(Boolean);
  const hasPayment =
    normalizedPayment.paymentStatus ||
    normalizedPayment.dueDate ||
    Number.isFinite(normalizedPayment.amountPaid) ||
    amountRemaining !== safeGrandTotal;

  const isPaid = normalizedPayment.paymentStatus === "paid";
  const isPartial = normalizedPayment.paymentStatus === "partially_paid";
  const isUnpaidOrToBePaid =
    normalizedPayment.paymentStatus === "unpaid" ||
    normalizedPayment.paymentStatus === "to_be_paid";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.header}>INVOICE</Text>
        <View style={styles.headerRow}>
          {normalizedHeader.logo && <Image src={normalizedHeader.logo} style={styles.logo} />}
          <View style={styles.invoiceRow}>
            {normalizedHeader.invoiceNo && (
              <Text style={styles.invoiceValue}>
                Invoice No    :     {normalizedHeader.invoiceNo}
              </Text>
            )}
            {normalizedHeader.invoiceDate && (
              <Text style={styles.invoiceValue}>
                Invoice Date :     {normalizedHeader.invoiceDate}
              </Text>
            )}
          </View>
        </View>

        {/* Billed By */}
        {hasBilledBy && (
          <View style={styles.section}>
            <Text style={styles.label}>Billed By</Text>
            {normalizedBilledBy.name && <Text style={styles.value}>{normalizedBilledBy.name}</Text>}
            {normalizedBilledBy.businessName && <Text style={styles.value}>{normalizedBilledBy.businessName}</Text>}
            {normalizedBilledBy.gstin && <Text style={styles.value}>GSTIN: {normalizedBilledBy.gstin}</Text>}
            {formatAddress(normalizedBilledBy) && (
              <Text style={styles.value}>Address: {formatAddress(normalizedBilledBy)}</Text>
            )}
          </View>
        )}

        {/* Billed To */}
        {hasBilledTo && (
          <View style={styles.section}>
            <Text style={styles.label}>Billed To</Text>
            {normalizedBilledTo.name && <Text style={styles.value}>{normalizedBilledTo.name}</Text>}
            {normalizedBilledTo.businessName && <Text style={styles.value}>{normalizedBilledTo.businessName}</Text>}
            {normalizedBilledTo.gstin && <Text style={styles.value}>GSTIN: {normalizedBilledTo.gstin}</Text>}
            {formatAddress(normalizedBilledTo) && (
              <Text style={styles.value}>Address: {formatAddress(normalizedBilledTo)}</Text>
            )}
          </View>
        )}

        {/* Items Table */}
        {normalizedItems.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {["Description", "Qty", "Rate", "Amount", "Tax %", "GST %", "VAT %", "Discount", "Total"].map(
                (headerText, idx) => (
                  <Text key={idx} style={[styles.tableColHeader, { width: [149, 30, 60, 60, 30, 30, 30, 60, 65][idx] }]}>
                    {headerText}
                  </Text>
                )
              )}
            </View>
            {normalizedItems.map((rawItem = {}, idx) => {
              const qty = safeNum(rawItem.qty);
              const rate = safeNum(rawItem.rate);
              const tax = safeNum(rawItem.tax);
              const gst = safeNum(rawItem.gst);
              const vat = safeNum(rawItem.vat);
              const discount = safeNum(rawItem.discount);

              const amount = qty * rate;
              const taxed = amount + (amount * tax) / 100 + (amount * gst) / 100 + (amount * vat) / 100;
              const total = taxed - discount;

              return (
                <View style={styles.tableRow} key={`row-${idx}`}>
                  <Text style={[styles.tableCol, { width: 149 }]}>{wrapText(safeStr(rawItem.description), 25)}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 30 }]}>{qty}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 60 }]}>{fmtMoney(rate)}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 60 }]}>{fmtMoney(amount)}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 30 }]}>{tax}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 30 }]}>{gst}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 30 }]}>{vat}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 60 }]}>{discount}</Text>
                  <Text style={[styles.tableCol, styles.tableColNumeric, { width: 65 }]}>{fmtMoney(total)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Totals & Payment */}
        <View style={styles.totalsContainer}>
          {hasPayment && (
            <View>
              {normalizedPayment.paymentStatus && (
                <>
                  <Text style={styles.paymentValue}>Payment Status  :</Text>
                  <Text style={styles.paymentValue}>{formatPaymentStatus(normalizedPayment.paymentStatus)}</Text>
                </>
              )}
              {!isPaid && normalizedPayment.dueDate && <Text style={styles.paymentValue}>Due Date: {normalizedPayment.dueDate}</Text>}
            </View>
          )}

          <View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total     :    </Text>
              <Text style={styles.totalValue}>${fmtMoney(safeGrandTotal)}</Text>
            </View>
            {isPartial && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Amount Paid  :    </Text>
                  <Text style={styles.totalValue}>${fmtMoney(normalizedPayment.amountPaid)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Remaining      :    </Text>
                  <Text style={styles.totalValue}>${fmtMoney(amountRemaining)}</Text>
                </View>
              </>
            )}
            {isUnpaidOrToBePaid && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Remaining      :    </Text>
                <Text style={styles.totalValue}>${fmtMoney(amountRemaining)}</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
