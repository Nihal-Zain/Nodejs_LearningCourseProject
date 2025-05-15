const db = require('../../config/db');

exports.getQuizResults = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM users_info');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
