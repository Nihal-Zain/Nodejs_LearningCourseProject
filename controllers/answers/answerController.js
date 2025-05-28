const db = require('../../config/db');

// Create a new answer
exports.createAnswer = (req, res) => {
    const { user_id, question_id, choice_id, target_user_id } = req.body;
    const query = 'INSERT INTO answers (user_id, question_id, choice_id, target_user_id) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, question_id, choice_id, target_user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, user_id, question_id, choice_id, target_user_id });
    });
};

// Get all answers
exports.getAllAnswers = (req, res) => {
    const query = 'SELECT * FROM answers ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get answer by ID
exports.getAnswerById = (req, res) => {
    const answerId = req.params.id;
    const query = 'SELECT * FROM answers WHERE id = ?';
    db.query(query, [answerId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Answer not found' });
        res.json(results[0]);
    });
};

// Get answers by user_id (who answered)
exports.getAnswersByUser = (req, res) => {
    const userId = req.params.user_id;
    const query = 'SELECT * FROM answers WHERE user_id = ? ORDER BY id DESC';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get answers by target_user_id (who is evaluated)
exports.getAnswersByTargetUser = (req, res) => {
    const targetUserId = req.params.target_user_id;
    const query = 'SELECT * FROM answers WHERE target_user_id = ? ORDER BY id DESC';
    db.query(query, [targetUserId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Update an answer by ID
exports.updateAnswer = (req, res) => {
    const answerId = req.params.id;
    const { user_id, question_id, choice_id, target_user_id } = req.body;
    const query = 'UPDATE answers SET user_id = ?, question_id = ?, choice_id = ?, target_user_id = ? WHERE id = ?';
    db.query(query, [user_id, question_id, choice_id, target_user_id, answerId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Answer not found' });
        res.json({ message: 'Answer updated successfully' });
    });
};

// Delete an answer by ID
exports.deleteAnswer = (req, res) => {
    const answerId = req.params.id;
    const query = 'DELETE FROM answers WHERE id = ?';
    db.query(query, [answerId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Answer not found' });
        res.json({ message: 'Answer deleted successfully' });
    });
};
