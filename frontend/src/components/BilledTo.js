import React from "react";

export default function BilledTo({ billedTo, setBilledTo }) {
  const handleChange = (field, value) =>
    setBilledTo({ ...billedTo, [field]: value });

  return (
    <div className="section">
      <h2>Billed To</h2>
      {Object.entries({
        businessName: "Client's Business Name*",
        gstin: "Client's GSTIN (optional)",
        address: "Address (optional)",
        city: "City (optional)",
        state: "State (optional)",
        postalCode: "ZIP Code (optional)",
        country: "Country (optional)",
      }).map(([field, label]) => (
        <div className="form-group" key={field}>
          <label>
            {label.includes("*") ? (
              <>
                {label.replace("*", "")}
                <span className="required-star">*</span>
              </>
            ) : (
              label
            )}
          </label>
          <input
            type="text"
            value={billedTo[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            required={label.includes("*")}
          />
        </div>
      ))}
    </div>
  );
}
