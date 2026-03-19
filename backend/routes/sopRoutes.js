const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadSOP,deleteSOP } = require("../controllers/sopController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 } 
});

router.post("/upload", upload.single("file"), uploadSOP);
router.delete("/delete/:filename", deleteSOP);
module.exports = router;