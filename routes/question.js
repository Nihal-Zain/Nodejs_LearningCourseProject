const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/questions', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM question');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
