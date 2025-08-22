import React from "react";

export default function Header({ header, setHeader }) {
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target.result;
    };

    img.onload = () => {
      const MAX_WIDTH = 500;
      const MAX_HEIGHT = 500;
      let width = img.width;
      let height = img.height;

      if (width / height > MAX_WIDTH / MAX_HEIGHT) {
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const resizedDataUrl = canvas.toDataURL("image/png");
      setHeader({ ...header, logo: resizedDataUrl });
    };

    reader.readAsDataURL(file);
  };

  const removeLogo = () => setHeader({ ...header, logo: null });

  return (
    <div className="header">
      {!header.logo ? (
        <label htmlFor="logoInput" className="upload-logo">
          Add Business Logo
          <input
            type="file"
            accept="image/*"
            id="logoInput"
            style={{ display: "none" }}
            onChange={handleLogoChange}
          />
        </label>
      ) : (
        <div className="uploaded-logo">
          <img src={header.logo} alt="Business Logo" />
          <button onClick={removeLogo}>x</button>
        </div>
      )}

      <div className="invoice-details">
        <div className="form-group">
          <label>
            Invoice No<span className="required-star">*</span>
          </label>
          <input
            type="text"
            value={header.invoiceNo}
            onChange={(e) => setHeader({ ...header, invoiceNo: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>
            Invoice Date<span className="required-star">*</span>
          </label>
          <input
            type="date"
            value={header.invoiceDate}
            onChange={(e) => setHeader({ ...header, invoiceDate: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
}
