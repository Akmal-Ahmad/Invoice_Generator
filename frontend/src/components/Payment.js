import React, { useState, useEffect } from "react";

export default function Payment({ payment, setPayment, grandTotal }) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const amountRemaining = Math.max(
    grandTotal - (parseFloat(payment.amountPaid) || 0),
    0
  );

  // Prevent invalid status if grandTotal is 0
  useEffect(() => {
    if (
      grandTotal === 0 &&
      (payment.paymentStatus === "partially_paid" || payment.paymentStatus === "to_be_paid")
    ) {
      showToastMessage(
        "Cannot select Partially Paid or To Be Paid when Grand Total is 0"
      );
      setPayment((prev) => ({ ...prev, paymentStatus: "paid", dueDate: "", amountPaid: "" }));
    }
  }, [grandTotal, payment.paymentStatus, setPayment]);

  const handlePaymentChange = (e) => {
    const value = e.target.value;

    if (grandTotal === 0 && (value === "partially_paid" || value === "to_be_paid")) {
      showToastMessage(
        "Cannot select Partially Paid or To Be Paid when Grand Total is 0"
      );
      return;
    }

    setPayment((prev) => ({
      ...prev,
      paymentStatus: value,
      // reset only if new status is not paid
      amountPaid: value === "paid" ? "" : prev.amountPaid,
      dueDate: value === "paid" ? "" : prev.dueDate,
    }));
  };

  const handleAmountPaidChange = (e) => {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) return setPayment((prev) => ({ ...prev, amountPaid: "" }));
    if (val <= 0) return showToastMessage("Amount Paid must be greater than 0");
    if (val >= grandTotal)
      return showToastMessage(
        `Amount Paid must be less than Grand Total ($${grandTotal.toFixed(2)})`
      );

    setPayment((prev) => ({ ...prev, amountPaid: val }));
  };

  const toastStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#ff5252",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    fontWeight: "bold",
    zIndex: 1000,
  };

  return (
    <div className="section" style={{ marginTop: "20px" }}>
      {showToast && <div style={toastStyle}>{toastMessage}</div>}

      <h2>Payment</h2>

      <div className="form-group">
        <label htmlFor="paymentStatus">
          Payment Status<span className="required-star">*</span>
        </label>
        <select
          id="paymentStatus"
          value={payment.paymentStatus}
          onChange={handlePaymentChange}
        >
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="to_be_paid">To Be Paid</option>
        </select>
      </div>

      {(payment.paymentStatus === "partially_paid" || payment.paymentStatus === "to_be_paid") && (
        <>
          <div className="form-group">
            <label htmlFor="dueDate">
              Due Date<span className="required-star">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              value={payment.dueDate}
              onChange={(e) => setPayment((prev) => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>

          {payment.paymentStatus === "partially_paid" && (
            <div className="form-group">
              <label htmlFor="amountPaid">
                Amount Paid<span className="required-star">*</span>
              </label>
              <input
                type="number"
                id="amountPaid"
                value={payment.amountPaid}
                min="0.01"
                max={grandTotal - 0.01}
                step="any"
                onChange={handleAmountPaidChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Amount Remaining</label>
            <div style={{ fontWeight: "bold", fontSize: "1rem" }}>
              ${amountRemaining.toFixed(2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
