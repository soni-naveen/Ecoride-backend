const express = require("express");
const app = express();

required("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
