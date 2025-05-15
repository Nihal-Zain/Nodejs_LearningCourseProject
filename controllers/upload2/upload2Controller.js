const db = require('../../config/db');

exports.getUpload2 = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM upload2');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
