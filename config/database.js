const mongoose = require("mongoose");
require("dotenv").config();

// Connection establishment
const dbConnect = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB connected successfully"))
    .catch((error) => {
      console.log("Issue in DB connection");
      console.error(error.message);
      process.exit(1);
      //Basically if you want to exit with success use 0 if you want to exit with failure use 1.
    });
};

module.exports = dbConnect;

// In simple terms, useNewUrlParser: true and useUnifiedTopology: true are options used when connecting to a MongoDB database in JavaScript.

// useNewUrlParser: true: This option tells MongoDB to use the new URL parser when connecting. It's mainly used to avoid deprecation warnings and ensure compatibility with future versions of MongoDB.

// useUnifiedTopology: true: This option enables the new server discovery and monitoring engine in MongoDB's driver. It provides better performance and handles server selection, server discovery, and monitoring more efficiently.

// So, both options are about improving compatibility, performance, and handling of connections to a MongoDB database.
