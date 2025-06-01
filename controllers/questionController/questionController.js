const db = require('../../config/db');

// Get All Questions
exports.getAllQuestions = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM questions ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Question By ID
exports.getQuestionById = async (req, res) => {
    const questionId = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [questionId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Question
exports.createQuestion = async (req, res) => {
    const { text, section_id, sub_section_id, target_type = 'self' } = req.body;

    const allowedTypes = ['manager_about_employee', 'self'];
    if (!allowedTypes.includes(target_type)) {
        return res.status(400).json({ error: 'Invalid target_type value' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO questions (text, section_id, sub_section_id, target_type) VALUES (?, ?, ?, ?)',
            [text, section_id, sub_section_id || null, target_type]
        );

        res.status(201).json({
            id: result.insertId,
            text,
            section_id,
            sub_section_id,
            target_type
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Question
exports.updateQuestion = async (req, res) => {
    const questionId = req.params.id;
    const { text, section_id, sub_section_id, target_type } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE questions SET text = ?, section_id = ?, sub_section_id = ?, target_type = ? WHERE id = ?',
            [text, section_id, sub_section_id || null, target_type, questionId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Question
exports.deleteQuestion = async (req, res) => {
    const questionId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM questions WHERE id = ?', [questionId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
