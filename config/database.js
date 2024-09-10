const mongoose = require("mongoose");
require("dotenv").config();

// Connection establishment
exports.connect = () => {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("Issue in DB connection");
    console.log(error.message);
    process.exit(1);
  }
  //Basically if you want to exit with success use 0 if you want to exit with failure use 1.
};
