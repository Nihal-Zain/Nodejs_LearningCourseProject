const e = require('express');
const db = require('../../config/db');
const path = require('path');

// Get All SubSections
exports.getAllSubSections = (req, res) => {
    const query = 'SELECT * FROM sub_sections ORDER BY id DESC';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get SubSection by ID
exports.getSubSectionById = (req, res) => {
    const subSectionId = req.params.id;
    const query = 'SELECT * FROM sub_sections WHERE id = ?';
    db.query(query, [subSectionId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Sub-section not found' });
        res.json(results[0]);
    });
};

// Create SubSection
exports.createSubSection = (req, res) => {
    const { title, section_id } = req.body;

    const query = 'INSERT INTO sub_sections (title, section_id) VALUES (?, ?)';
    db.query(query, [title, section_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, title, section_id });
    });
};

// Update SubSection
exports.updateSubSection = (req, res) => {
    const subSectionId = req.params.id;
    const { title, section_id } = req.body;

    const query = 'UPDATE sub_sections SET title = ?, section_id = ? WHERE id = ?';
    db.query(query, [title, section_id, subSectionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Sub-section not found' });
        res.json({ message: 'Sub-section updated successfully' });
    });
};

// Delete SubSection
exports.deleteSubSection = (req, res) => {
    const subSectionId = req.params.id;

    const query = 'DELETE FROM sub_sections WHERE id = ?';
    db.query(query, [subSectionId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Sub-section not found' });
        res.json({ message: 'Sub-section deleted successfully' });
    });
};
