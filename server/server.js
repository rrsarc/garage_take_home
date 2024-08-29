const express = require("express");
const fetch = require("node-fetch");
const PDFDocument = require("pdfkit");
const stylePDF = require("./pdfStyler");
const path = require("path");

const app = express();
const port = 3001;

app.use(express.json());

app.use((req, res, next) => {
  const logEntry = `
  [${new Date().toISOString()}] ${req.method} ${req.url}
  Headers: ${JSON.stringify(req.headers)}
  Body: ${JSON.stringify(req.body)}
  `;
  console.log(logEntry);
  next();
});

app.use(express.static(path.join(__dirname, "../client/build")));

function extractUuidFromUrl(inputUrl) {
  const uuidRegex =
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = inputUrl.match(uuidRegex);
  if (match) {
    return match[0];
  }
  throw new Error("Invalid URL: UUID not found");
}

app.post("/generate-invoice", async (req, res) => {
  try {
    const inputUrl = req.body.link;
    if (!inputUrl) {
      return res
        .status(400)
        .json({ error: "URL is required in the request body" });
    }

    let listingId;
    try {
      listingId = extractUuidFromUrl(inputUrl);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!listingId) {
      return res.status(400).json({ error: "Listing URI required" });
    }

    const apiResponse = await fetch(
      "https://garage-backend.onrender.com/getListing",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listingId }),
      }
    );

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();

    if (responseData.error) {
      throw new Error(`API returned an error: ${responseData.error}`);
    }

    const listingData = responseData.result.listing;

    const invoiceData = {
      invoiceNumber: `INV-${listingId.slice(0, 8)}`,
      date: new Date().toLocaleDateString(),
      listingTitle: listingData.listingTitle,
      sellingPrice: listingData.sellingPrice,
      totalDue: listingData.sellingPrice,
      listingDescription: listingData.listingDescription,
      imageUrls: listingData.imageUrls,
    };

    const doc = new PDFDocument();
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader("Content-Length", pdfData.length);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
      res.send(pdfData);
    });

    await stylePDF(doc, invoiceData);

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
