const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/Mongo_connect.js");
const userRoute = require("./routes/users.js");
const pinRoute = require("./routes/pins.js");

dotenv.config();

app.use(express.json());

connectDB();

app.use("/api/users", userRoute);
app.use("/api/pins", pinRoute);


app.listen(8800, () => {
  console.log("Backend server is running!");
});