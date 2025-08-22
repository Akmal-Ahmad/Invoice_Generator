import React from "react";
import ItemRow from "./ItemRow";

export default function ItemsTable({ items, onChange, onAdd, onRemove, grandTotal }) {
  return (
    <div className="section">
      <h2>Items / Services</h2>
      <table>
        <thead>
          <tr style={{ background: "#eaeaea" }}>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Custom Tax Rate (%)</th>
            <th>GST (%)</th>
            <th>VAT (%)</th>
            <th>Discount</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <ItemRow
              key={i}
              index={i}
              item={item}
              onChange={onChange}
              onRemove={onRemove}
              canRemove={items.length > 1}
            />
          ))}
        </tbody>
      </table>
      <button type="button" onClick={onAdd} className="add-btn">
        + Add Item
      </button>
      <div className="subtotal">Grand Total: ${grandTotal.toFixed(2)}</div>
    </div>
  );
}
