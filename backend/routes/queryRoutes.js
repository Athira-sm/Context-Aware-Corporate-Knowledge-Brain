const express = require("express");
const { querySOP } = require("../controllers/queryController");

const router = express.Router();

// POST /api/query
router.post("/", querySOP);

module.exports = router;
