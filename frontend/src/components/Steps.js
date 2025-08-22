import React, { useState, useContext, useEffect } from "react";
import "../styles/stepsstyles.css";
import Header from "./Header";
import BilledBy from "./BilledBy";
import BilledTo from "./BilledTo";
import ItemsTable from "./ItemsTable";
import Payment from "./Payment";
import InvoiceDocument from "./InvoiceDocument";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { UserContext } from "../UserContext";

function Toast({ message, onClose }) {
  // Auto close after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        backgroundColor: "#f57c00",
        color: "white",
        padding: "12px 20px",
        borderRadius: 6,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      {message}
    </div>
  );
}

export default function Steps() {
  const { user } = useContext(UserContext);

  // Header state
  const [header, setHeader] = useState({
    logo: null,
    invoiceNo: "",
    invoiceDate: "",
  });

  // Billed By state
  const [billedBy, setBilledBy] = useState({
    country: "",
    businessName: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Billed To state
  const [billedTo, setBilledTo] = useState({
    country: "",
    businessName: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Items state
  const [items, setItems] = useState([
    { description: "", qty: 1, rate: 0, tax: 0, gst: 0, vat: 0, discount: 0 },
  ]);

  // Payment state
  const [payment, setPayment] = useState({
    paymentStatus: "paid",
    dueDate: "",
    amountPaid: "",
  });

  // PDF snapshot and key
  const [pdfData, setPdfData] = useState(null);
  const [pdfKey, setPdfKey] = useState(0);

  // Toast message state
  const [toastMessage, setToastMessage] = useState(null);

  // Compute grand total
  const computeGrandTotal = (list) =>
    list.reduce((sum, item) => {
      const amount = item.qty * item.rate;
      const taxed =
        amount +
        (amount * item.tax) / 100 +
        (amount * item.gst) / 100 +
        (amount * item.vat) / 100;
      return sum + (taxed - item.discount);
    }, 0);

  const grandTotal = computeGrandTotal(items);

  // Handle item change
  const handleItemChange = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = field === "description" ? value : parseFloat(value) || 0;
    setItems(updated);
  };

  // Add item
  const addItem = () => {
    setItems([
      ...items,
      { description: "", qty: 1, rate: 0, tax: 0, gst: 0, vat: 0, discount: 0 },
    ]);
  };

  // Remove item
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  // Save invoice to database for logged-in users
  const saveInvoiceToDB = async () => {
    const token = localStorage.getItem("jwtToken");

    // If no token, treat as guest — skip DB save, no logout alert
    if (!token) {
      console.log("Guest user - skipping saving invoice to database.");
      return;
    }

    if (!user?.email) {
      console.warn("No logged in user email found - skipping save.");
      return;
    }

    const invoiceToSave = {
      header,
      billedBy,
      billedTo,
      payment: {
        ...payment,
        // Ensure amountPaid is properly set for "paid" status
        amountPaid: payment.paymentStatus === "paid" ? grandTotal : payment.amountPaid,
      },
      grandTotal,
    };

    try {
      const response = await fetch("https://invoice-generator-backend-jg51.onrender.com/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceToSave),
      });

      const result = await response.json();
      console.log("Invoice saved:", result);
    } catch (err) {
      console.error("Failed to save invoice:", err);
    }
  };

  // Generate PDF snapshot
  const handleGenerate = async () => {
    if (!items.some((i) => i.description.trim() !== "")) {
      alert("Please add at least one item with description.");
      return;
    }

    if (
      (payment.paymentStatus === "partially_paid" && !payment.amountPaid) ||
      (payment.paymentStatus === "to_be_paid" && !payment.dueDate)
    ) {
      alert("Please enter Payment details.");
      return;
    }

    setPdfData({
      header: { ...header },
      billedBy: { ...billedBy },
      billedTo: { ...billedTo },
      items: [...items],
      payment: { ...payment },
      grandTotal,
    });

    setPdfKey((prev) => prev + 1);

    await saveInvoiceToDB();
  };

  // View PDF in new tab
  const handleViewPDF = async () => {
    if (!pdfData) return;

    const blob = await pdf(<InvoiceDocument {...pdfData} />).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  // Handle Track Payments button click with toast for unauthorized users
  const handleTrackPayments = () => {
    if (!user?.email) {
      setToastMessage("You need to log in to track payments");
    } else {
      window.location.href = "https://invoice-generator-akmal-ahmad.netlify.app/payments.html";
    }
  };

  const closeToast = () => setToastMessage(null);

  return (
    <>
      <form
        className="invoice-container"
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
      >
        <h1>Invoice</h1>

        {/* Input sections */}
        <Header header={header} setHeader={setHeader} />
        <BilledBy billedBy={billedBy} setBilledBy={setBilledBy} />
        <BilledTo billedTo={billedTo} setBilledTo={setBilledTo} />
        <ItemsTable
          items={items}
          onChange={handleItemChange}
          onAdd={addItem}
          onRemove={removeItem}
          grandTotal={grandTotal}
        />
        <Payment payment={payment} setPayment={setPayment} grandTotal={grandTotal} />

        {/* Generate Button */}
        <button type="submit" className="generate-btn">
          Generate Invoice
        </button>

        {/* PDF Download, View & Track Payments Buttons */}
        {pdfData && (
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <PDFDownloadLink
              key={pdfKey}
              document={<InvoiceDocument {...pdfData} />}
              fileName="invoice.pdf"
              style={{
                textDecoration: "none",
                padding: "8px 12px",
                color: "#fff",
                backgroundColor: "#4caf50",
                borderRadius: "4px",
              }}
            >
              {({ loading }) => (loading ? "Preparing PDF..." : "Download Invoice")}
            </PDFDownloadLink>

            <button
              type="button"
              onClick={handleViewPDF}
              style={{
                padding: "8px 12px",
                backgroundColor: "#2196f3",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              View Invoice
            </button>

            <button
              type="button"
              onClick={handleTrackPayments}
              style={{
                padding: "8px 12px",
                backgroundColor: "#f57c00",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Track Payments
            </button>
          </div>
        )}
      </form>

      {/* Render Toast if toastMessage is set */}
      {toastMessage && <Toast message={toastMessage} onClose={closeToast} />}
    </>
  );
}
