const mongoose = require("mongoose");
require("dotenv").config();

// Connection establishment
const dbConnect = () => {
  mongoose.connect(process.env.DATABASE_URL);
  try {
    console.log("DB connected successfully");
  } catch (error) {
    console.log("Issue in DB connection");
    console.log(error.message);
    process.exit(1);
  }
  //Basically if you want to exit with success use 0 if you want to exit with failure use 1.
};

module.exports = dbConnect;
