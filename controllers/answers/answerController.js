const db = require('../../config/db');

// Create a new answer
exports.createAnswer = async (req, res) => {
  try {
    const { user_id, question_id, choice_id, target_user_id } = req.body;
    const query = 'INSERT INTO answers (user_id, question_id, choice_id, target_user_id) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [user_id, question_id, choice_id, target_user_id]);
    res.status(201).json({ id: result.insertId, user_id, question_id, choice_id, target_user_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all answers
exports.getAllAnswers = async (req, res) => {
  try {
    const query = 'SELECT * FROM answers ORDER BY id DESC';
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get answer by ID
exports.getAnswerById = async (req, res) => {
  try {
    const answerId = req.params.id;
    const query = 'SELECT * FROM answers WHERE id = ?';
    const [results] = await db.query(query, [answerId]);
    if (results.length === 0) return res.status(404).json({ error: 'Answer not found' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get answers by user_id (who answered)
exports.getAnswersByUser = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const query = 'SELECT * FROM answers WHERE user_id = ? ORDER BY id DESC';
    const [results] = await db.query(query, [userId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get answers by target_user_id (who is evaluated)
exports.getAnswersByTargetUser = async (req, res) => {
  try {
    const targetUserId = req.params.target_user_id;
    const query = 'SELECT * FROM answers WHERE target_user_id = ? ORDER BY id DESC';
    const [results] = await db.query(query, [targetUserId]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an answer by ID
exports.updateAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const { user_id, question_id, choice_id, target_user_id } = req.body;
    const query = 'UPDATE answers SET user_id = ?, question_id = ?, choice_id = ?, target_user_id = ? WHERE id = ?';
    const [result] = await db.query(query, [user_id, question_id, choice_id, target_user_id, answerId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Answer not found' });
    res.json({ message: 'Answer updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an answer by ID
exports.deleteAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    const query = 'DELETE FROM answers WHERE id = ?';
    const [result] = await db.query(query, [answerId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Answer not found' });
    res.json({ message: 'Answer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
