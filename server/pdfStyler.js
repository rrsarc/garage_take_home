const PDFDocument = require("pdfkit");
const fetch = require("node-fetch");

async function stylePDF(doc, invoiceData) {
  const regular = "Helvetica";
  const bold = "Helvetica-Bold";

  // Logo
  doc.image("./garage.png", 50, 50, { width: 80 });

  // // Garage details
  // doc
  //   .font(bold)
  //   .fontSize(10)
  //   .text("Garage Technologies Inc.", 50, 140)
  //   .font(regular)
  //   .fontSize(9)
  //   .text("https://www.withgarage.com/", 50, 153);

  const imageWidth = 200; // Increased width
  const imageHeight = 130; // Increased height
  const imageX = (doc.page.width - imageWidth) / 2;
  let imageEndY = 0;

  if (invoiceData.imageUrls && invoiceData.imageUrls.length > 0) {
    try {
      const response = await fetch(invoiceData.imageUrls[0]);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      doc.image(buffer, imageX, 180, {
        width: imageWidth,
        height: imageHeight,
      });
      imageEndY = 180 + imageHeight;
    } catch (error) {
      console.error("Error fetching the image:", error);
    }
  }

  // Header
  doc
    .font(bold)
    .fontSize(32)
    .fillColor("#1A4B84")
    .text("INVOICE", 400, 50, { align: "right" });
  doc
    .font(regular)
    .fontSize(9)
    .fillColor("black")
    .text(`Invoice # ${invoiceData.invoiceNumber}`, 400, 90, { align: "right" })
    .text(`Date: ${invoiceData.date}`, 400, 103, { align: "right" });

  const detailsStartY = imageEndY + 20;

  // Details section
  doc
    .font(bold)
    .fontSize(15)
    .fillColor("black")
    .text("Details", 50, detailsStartY);

  doc
    .font(regular)
    .fontSize(12)
    .text(invoiceData.listingTitle, 50, detailsStartY + 18);

  const lines = invoiceData.listingDescription
    .split("\n")
    .filter(
      (line) =>
        line.trim() && !line.includes("Message with questions and offers!")
    );
  const descriptors = lines.slice(0, 4);

  descriptors.forEach((desc, index) => {
    doc
      .font(regular)
      .fontSize(10)
      .text(`• ${desc}`, 50, detailsStartY + 38 + index * 14);
  });

  if (lines.length > 3) {
    doc
      .font(regular)
      .fontSize(10)
      .text("• And more...", 50, detailsStartY + 38 + descriptors.length * 14);
  }

  const pricingStartY = detailsStartY + 140 + descriptors.length * 10;
  doc.font(bold).fontSize(15).text("Pricing", 50, pricingStartY);

  const tableTop = pricingStartY + 20;
  const tableLeft = 50;
  const valueRight = 300;

  doc
    .font(regular)
    .fontSize(10)
    .text("Selling Price", tableLeft, tableTop)
    .text(`$${invoiceData.sellingPrice}`, valueRight, tableTop, {
      align: "right",
    });

  return doc;
}

module.exports = stylePDF;
