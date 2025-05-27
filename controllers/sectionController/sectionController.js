const e = require('express');
const db = require('../../config/db');
const path = require('path');

// Get all sections
exports.getAllSections = (req, res) => {
    const query = 'SELECT * FROM sections ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
}

// Get section by ID
exports.getSectionById = (req, res) => {
    const sectionId = req.params.id;
    const query = 'SELECT * FROM sections WHERE id = ?';
    db.query(query, [sectionId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Section not found' });
        res.json(results[0]);
    });
};

// Create a new section
exports.createSection = (req, res) => {
    const { title, ismanager = 0 } = req.body;
    const query = 'INSERT INTO sections (title, ismanager) VALUES (?, ?)';
    db.query(query, [title, ismanager], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, title, ismanager });
    });
};

// Update a section
exports.updateSection = (req, res) => {
    const sectionId = req.params.id;
    const { title, ismanager } = req.body;

    const query = 'UPDATE sections SET title = ?, ismanager = ? WHERE id = ?';
    db.query(query, [title, ismanager, sectionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found' });
        res.json({ message: 'Section updated successfully' });
    });
};

// Delete a section
exports.deleteSection = (req, res) => {
    const sectionId = req.params.id;
    const query = 'DELETE FROM sections WHERE id = ?';
    db.query(query, [sectionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found' });
        res.json({ message: 'Section deleted successfully' });
    });
};
