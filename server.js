const express = require('express');
const app = express();
require('dotenv').config();
const blogRoutes = require('./routes/blogRoutes');

app.use(express.json());
app.use('/api/blogs', blogRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});
