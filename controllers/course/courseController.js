const db = require('../../config/db');

exports.getcourses = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM course');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
