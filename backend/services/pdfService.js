const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data;
};

const chunkTextWithPage = (pdfData, chunkSize = 1000, overlap = 200) => {
  const text = pdfData.text;
  const totalPages = pdfData.numpages || 1;

  const chunks = [];
  let start = 0;
  let page = 1;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);

    chunks.push({
      content: text.slice(start, end),
      page
    });

    start += chunkSize - overlap;
    page = Math.min(totalPages, page + 1);
  }

  return chunks;
};

module.exports = { extractTextFromPDF, chunkTextWithPage };