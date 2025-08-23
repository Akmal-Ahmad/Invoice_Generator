import React from "react";

export default function ItemRow({ item, index, onChange, onRemove, canRemove }) {
  const { description, qty, rate, tax, gst, vat, discount } = item;

  const amount = qty * rate;
  const taxed = amount + (amount * tax) / 100 + (amount * gst) / 100 + (amount * vat) / 100;
  const finalTotal = taxed - discount;

  return (
    <tr>
      <td><input type="text" value={description} onChange={(e) => onChange(index, "description", e.target.value)} placeholder="Service / Item" required /></td>
      <td><input type="number" min="1" value={qty} onChange={(e) => onChange(index, "qty", Math.max(1, e.target.value))} /></td>
      <td><input type="number" min="0" step="0.01" value={rate} onChange={(e) => onChange(index, "rate", Math.max(0, e.target.value))} /></td>
      <td className="amount">{amount.toFixed(2)}</td>
      <td><input type="number" min="0" step="0.01" value={tax} onChange={(e) => onChange(index, "tax", Math.max(0, e.target.value))} /></td>
      <td><input type="number" min="0" step="0.01" value={gst} onChange={(e) => onChange(index, "gst", Math.max(0, e.target.value))} /></td>
      <td><input type="number" min="0" step="0.01" value={vat} onChange={(e) => onChange(index, "vat", Math.max(0, e.target.value))} /></td>
      <td><input type="number" min="0" step="0.01" value={discount} onChange={(e) => onChange(index, "discount", Math.max(0, e.target.value))} /></td>
      <td className="total">{finalTotal.toFixed(2)}</td>
      <td>{canRemove && <button type="button" className="remove-btn" onClick={() => onRemove(index)}>×</button>}</td>
    </tr>
  );
}
