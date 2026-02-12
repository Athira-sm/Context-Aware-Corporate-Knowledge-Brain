const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");   

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.use("/api/sop", require("./routes/sopRoutes"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});