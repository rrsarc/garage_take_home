import React, { useState } from "react";
import "./InvoiceForm.css";

const InvoiceForm = () => {
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Generating invoice...");

    try {
      const response = await fetch("/generate-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link }),
      });

      if (response.ok) {
        setMessage("Invoice generated successfully!");
      } else {
        setMessage("Failed to generate invoice. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="invoice-form-container">
      <h1 className="form-title">Fire Truck Invoice Generator</h1>
      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-group">
          <label htmlFor="link">Paste Garage fire truck listing URL:</label>
          <input
            type="text"
            id="link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="form-input"
            placeholder="https://www.withgarage.com/listing/..."
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Generate Invoice
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default InvoiceForm;
