const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/Mongo_connect.js");

dotenv.config();

app.use(express.json());

connectDB();


app.listen(8800, () => {
  console.log("Backend server is running!");
});