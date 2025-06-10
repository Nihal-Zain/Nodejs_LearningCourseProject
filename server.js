require('dotenv').config(); // Load environment variables
const app = require('./app');
const db = require('./config/db'); // Ensure this is the correct path to your db.js

const PORT = process.env.PORT || 3000;

// Test database connection before starting the server
db.getConnection()
  .then(() => {
    console.log('✅ Connected to database!');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // Exit if DB connection fails
  });
