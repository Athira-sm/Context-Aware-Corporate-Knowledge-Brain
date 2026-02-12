const express = require("express");
const multer = require("multer");
const { uploadSOP } = require("../controllers/sopController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

router.post("/upload", upload.single("file"), uploadSOP);

module.exports = router;