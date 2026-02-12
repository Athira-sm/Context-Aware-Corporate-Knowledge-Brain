const fs=require("fs")
const {extractTextFromPDF }=require("../services/pdfService")

const uploadSOP = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    const text = await extractTextFromPDF(filePath);

    fs.unlinkSync(filePath);

    res.json({
      message: "PDF uploaded and text extracted successfully ✅",
      preview: text.substring(0, 500)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed ❌" });
  }
};

module.exports = { uploadSOP };
