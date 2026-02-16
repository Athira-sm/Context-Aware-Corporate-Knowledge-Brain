const express = require("express");
const { querySOP } = require("../controllers/queryController");

const router = express.Router();


router.post("/", querySOP);

module.exports = router;
