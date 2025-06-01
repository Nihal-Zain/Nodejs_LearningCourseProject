const db = require('../../config/db');

exports.getRole = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM role');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
