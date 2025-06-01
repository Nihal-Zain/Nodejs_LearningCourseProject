const db = require('../../config/db');

// Get All Choices
exports.getAllChoices = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM choices ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Choice By ID
exports.getChoiceById = async (req, res) => {
    const choiceId = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM choices WHERE id = ?', [choiceId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Choice not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Choice
exports.createChoice = async (req, res) => {
    const { text, question_id, is_correct } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO choices (text, question_id, is_correct) VALUES (?, ?, ?)',
            [text, question_id, is_correct]
        );

        res.status(201).json({
            id: result.insertId,
            text,
            question_id,
            is_correct
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Choice
exports.updateChoice = async (req, res) => {
    const choiceId = req.params.id;
    const { text, question_id, is_correct } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE choices SET text = ?, question_id = ?, is_correct = ? WHERE id = ?',
            [text, question_id, is_correct, choiceId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Choice not found' });
        }

        res.json({ message: 'Choice updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Choice
exports.deleteChoice = async (req, res) => {
    const choiceId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM choices WHERE id = ?', [choiceId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Choice not found' });
        }

        res.json({ message: 'Choice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
