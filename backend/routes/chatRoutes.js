const express = require("express");
const { chatSOP } = require("../controllers/chatController");

const router = express.Router();

router.post("/", chatSOP);

module.exports = router;
