const express = require("express");
const multer = require("multer");
const { uploadSOP } = require("../controllers/sopController");

const router = express.Router();

// ✅ store files on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/upload", upload.single("file"), uploadSOP);

module.exports = router;
