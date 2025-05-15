const db = require('../../config/db');

exports.getSettings = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM settings');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
