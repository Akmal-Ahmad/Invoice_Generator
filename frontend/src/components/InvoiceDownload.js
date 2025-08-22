import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoiceDocument from "./InvoiceDocument";

export default function InvoiceDownload({ pdfData }) {
  if (!pdfData) return null;

  return (
    <PDFDownloadLink
      document={<InvoiceDocument {...pdfData} />}
      fileName="invoice.pdf"
      style={{
        textDecoration: "none",
        padding: "8px 12px",
        color: "#fff",
        backgroundColor: "#4caf50",
        borderRadius: "4px",
        display: "inline-block",
      }}
    >
      {({ loading }) => (loading ? "Preparing PDF..." : "Download Invoice")}
    </PDFDownloadLink>
  );
}
