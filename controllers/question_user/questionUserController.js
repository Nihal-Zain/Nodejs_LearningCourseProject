const db = require('../../config/db');

exports.getQuestionUser = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM question_user');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
