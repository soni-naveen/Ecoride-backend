const express = require("express");

// creates an Express application instance
const app = express();

//load config from env file
require("dotenv").config();
const PORT = process.env.PORT || 4000;

//cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//middleware to parse json request body
app.use(express.json());

//import and mount the API routes
const route = require("./routes/route");
app.use("/api/v1", route);

//default Route
app.get("/", (req, res) => {
  res.send(`<h1> This is HOMEPAGE </h1>`);
});

//connect to the database
const dbConnect = require("./config/database");
dbConnect();

//activate
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
