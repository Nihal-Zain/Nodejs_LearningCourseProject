require('dotenv').config(); // Load environment variables
const app = require('./app');
const db = require('./config/db'); // Ensure this is the correct path to your db.js


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
