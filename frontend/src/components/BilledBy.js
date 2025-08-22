import React from "react";

export default function BilledBy({ billedBy, setBilledBy }) {
  const handleChange = (field, value) =>
    setBilledBy({ ...billedBy, [field]: value });

  return (
    <div className="section">
      <h2>Billed By</h2>
      {Object.entries({
        businessName: "Your Business Name*",
        gstin: "Your GSTIN (optional)",
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
            value={billedBy[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            required={label.includes("*")}
          />
        </div>
      ))}
    </div>
  );
}
