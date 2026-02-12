// server.js (or index.js)
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");   // move connectDB here if not already

dotenv.config();

const app = express();
app.use(express.json());

// Connect DB first
connectDB();

app.use("/api/sop", require("./routes/sopRoutes"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});