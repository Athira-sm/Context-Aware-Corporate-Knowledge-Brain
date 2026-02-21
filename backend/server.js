const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");   
const cors = require("cors");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

app.use("/api/sop", require("./routes/sopRoutes"));
app.use("/api/query", require("./routes/queryRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/uploads", express.static("uploads"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});