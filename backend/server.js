require("dotenv").config();
const express=require("express");
const cors=require("cors");
const connectDB = require("./config/db");
const sopRoutes=require("./routes/sopRoutes")

const app=express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/sop", sopRoutes);

const port=5000
app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})
