const e = require('express');
const db = require('../../config/db');
const path = require('path');

// Get All Questions

exports.getAllQuestions = (req, res) => {   
    const query = 'SELECT * FROM questions ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    }
    );
}

// Get Question By ID
exports.getQuestionById = (req, res ) => {
    const questionId = req.params.id;
    const query = 'SELECT * FROM questions WHERE id = ?';
    db.query(query, [questionId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Question not found' });
        res.json(results[0]);
    });
}

// Create Question
exports.createQuestion = (req, res) => {
    const { text,section_id } = req.body;

    const query = 'INSERT INTO questions (text,section_id) VALUES (?, ?)';
    db.query(query, [text,section_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ id: result.insertId, text,section_id });
    });
}

// Update Question
exports.updateQuestion = (req, res) => {
    const questionId = req.params.id;
    const { text,section_id } = req.body;

    const query = 'UPDATE questions SET text=?,section_id=? WHERE id = ?';
    db.query(query, [text,section_id, questionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Question not found' });
        res.json({ message: 'Question updated successfully' });
    });
}

// Delete Question
exports.deleteQuestion = (req, res) => {
    const questionId = req.params.id;
    const query = 'DELETE FROM questions WHERE id = ?';
    db.query(query, [questionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Question not found' });
        res.json({ message: 'Question deleted successfully' });
    });
};