const e = require('express');
const db = require('../../config/db');
const path = require('path');

exports.getAllChoices = (req, res) => { 
    const query = 'SELECT * FROM choices ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

exports.getChoiceById = (req, res) => {
    const choiceId = req.params.id;
    const query = 'SELECT * FROM choices WHERE id = ?';
    db.query(query, [choiceId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Choice not found' });
        res.json(results[0]);
    });
};

exports.createChoice = (req, res) => {
    const { text, question_id ,is_correct } = req.body;

    const query = 'INSERT INTO choices (text, question_id,is_correct) VALUES (?, ?,?)';
    db.query(query, [text, question_id,is_correct], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({ id: result.insertId, text, question_id,is_correct });
    });
};
exports.updateChoice = (req, res) => {
    const choiceId = req.params.id;
    const { text, question_id,is_correct } = req.body;

    const query = 'UPDATE choices SET text=?,question_id=?,is_correct=? WHERE id = ?';
    db.query(query, [text, question_id,is_correct, choiceId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Choice not found' });
        res.json({ message: 'Choice updated successfully' });
    });
};

exports.deleteChoice = (req, res) => {
    const choiceId = req.params.id;
    const query = 'DELETE FROM choices WHERE id = ?';
    db.query(query, [choiceId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Choice not found' });
        res.json({ message: 'Choice deleted successfully' });
    });
};