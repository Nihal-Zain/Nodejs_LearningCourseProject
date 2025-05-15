// app.js
const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/category');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', categoryRoutes);

module.exports = app; // Export app for server.js
