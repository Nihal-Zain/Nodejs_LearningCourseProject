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

// Get section results (answers report)
exports.getSectionResults = (req, res) => {
    const sectionId = req.params.id;

    const query = `
        SELECT 
            s.id AS section_id,
            s.title AS section_title,
            COUNT(a.id) AS total_answers,
            COALESCE(SUM(c.is_correct), 0) AS correct_answers,
            ROUND(
                CASE WHEN COUNT(a.id) = 0 THEN 0
                     ELSE (COALESCE(SUM(c.is_correct), 0) / COUNT(a.id)) * 100
                END
            , 2) AS correct_percentage
        FROM sections s
        LEFT JOIN sub_sections ss ON ss.section_id = s.id
        LEFT JOIN questions q ON q.section_id = s.id OR q.sub_section_id = ss.id
        LEFT JOIN answers a ON a.question_id = q.id
        LEFT JOIN choices c ON a.choice_id = c.id
        WHERE s.id = ?
        GROUP BY s.id
    `;

    db.query(query, [sectionId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'No results found for this section' });
        res.json(results[0]);
    });
};

// Get results for each sub-section in a section
exports.getSubSectionResults = (req, res) => {
    const sectionId = req.params.id;

    const query = `
        SELECT 
            ss.id AS sub_section_id,
            ss.title AS sub_section_title,
            COUNT(a.id) AS total_answers,
            COALESCE(SUM(c.is_correct), 0) AS correct_answers,
            ROUND(
                CASE WHEN COUNT(a.id) = 0 THEN 0
                     ELSE (COALESCE(SUM(c.is_correct), 0) / COUNT(a.id)) * 100
                END
            , 2) AS correct_percentage
        FROM sub_sections ss
        LEFT JOIN questions q ON q.sub_section_id = ss.id
        LEFT JOIN answers a ON a.question_id = q.id
        LEFT JOIN choices c ON a.choice_id = c.id
        WHERE ss.section_id = ?
        GROUP BY ss.id
        ORDER BY ss.id DESC
    `;

    db.query(query, [sectionId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// Get results for each question in a section (including sub-sections)
exports.getQuestionResults = (req, res) => {
    const sectionId = req.params.id;

    const query = `
        SELECT 
            q.id AS question_id,
            q.text AS question_text,
            COUNT(a.id) AS total_answers,
            COALESCE(SUM(c.is_correct), 0) AS correct_answers,
            ROUND(
                CASE WHEN COUNT(a.id) = 0 THEN 0
                     ELSE (COALESCE(SUM(c.is_correct), 0) / COUNT(a.id)) * 100
                END
            , 2) AS correct_percentage
        FROM sections s
        LEFT JOIN sub_sections ss ON ss.section_id = s.id
        LEFT JOIN questions q ON q.section_id = s.id OR q.sub_section_id = ss.id
        LEFT JOIN answers a ON a.question_id = q.id
        LEFT JOIN choices c ON a.choice_id = c.id
        WHERE s.id = ?
        GROUP BY q.id
        ORDER BY q.id DESC
    `;

    db.query(query, [sectionId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
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
