const express = require('express');
const app = express();
const db = require('./config/db');
require('dotenv').config();


app.use(express.json());


app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
