const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.post("/generate-invoice", (req, res) => {
  const { link } = req.body;

  const uuidMatch = link.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );

  if (!uuidMatch) {
    return res.status(400).json({ error: "Invalid link format" });
  }

  const uuid = uuidMatch[0];

  // Generate the PDF ... ()

  res.status(200).json({ message: "Invoice generation requested", uuid });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
