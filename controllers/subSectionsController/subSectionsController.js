const db = require('../../config/db');

// Get All SubSections
exports.getAllSubSections = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sub_sections ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get SubSection by ID
exports.getSubSectionById = async (req, res) => {
    const subSectionId = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM sub_sections WHERE id = ?', [subSectionId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Sub-section not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create SubSection
exports.createSubSection = async (req, res) => {
    const { title, section_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO sub_sections (title, section_id) VALUES (?, ?)',
            [title, section_id]
        );
        res.status(201).json({ id: result.insertId, title, section_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update SubSection
exports.updateSubSection = async (req, res) => {
    const subSectionId = req.params.id;
    const { title, section_id } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE sub_sections SET title = ?, section_id = ? WHERE id = ?',
            [title, section_id, subSectionId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sub-section not found' });
        }
        res.json({ message: 'Sub-section updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete SubSection
exports.deleteSubSection = async (req, res) => {
    const subSectionId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM sub_sections WHERE id = ?', [subSectionId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sub-section not found' });
        }
        res.json({ message: 'Sub-section deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
