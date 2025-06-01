const db = require('../../config/db');

// Get all sections
exports.getAllSections = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM sections ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get section by ID
exports.getSectionById = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const [results] = await db.query('SELECT * FROM sections WHERE id = ?', [sectionId]);
    if (results.length === 0) return res.status(404).json({ error: 'Section not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get section results (answers report)
exports.getSectionResults = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const [results] = await db.query(`
      SELECT 
        s.id AS section_id,
        s.title AS section_title,
        COUNT(a.id) AS total_answers,
        COALESCE(SUM(c.is_correct), 0) AS correct_answers,
        ROUND(
          CASE WHEN COUNT(a.id) = 0 THEN 0
               ELSE (COALESCE(SUM(c.is_correct), 0) / COUNT(a.id)) * 100
          END, 2) AS correct_percentage
      FROM sections s
      LEFT JOIN sub_sections ss ON ss.section_id = s.id
      LEFT JOIN questions q ON q.section_id = s.id OR q.sub_section_id = ss.id
      LEFT JOIN answers a ON a.question_id = q.id
      LEFT JOIN choices c ON a.choice_id = c.id
      WHERE s.id = ?
      GROUP BY s.id
    `, [sectionId]);

    if (results.length === 0) return res.status(404).json({ error: 'No results found for this section' });
    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get sub-section results (non-manager sections)
exports.getSubSectionResults = async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await db.query(`
      SELECT 
        a.user_id,
        ss.id AS sub_section_id,
        ss.title AS sub_section_title,
        s.title AS section_title,
        COUNT(q.id) AS total_questions_answered,
        SUM(CASE WHEN c.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN sub_sections ss ON q.sub_section_id = ss.id
      JOIN sections s ON ss.section_id = s.id
      JOIN choices c ON a.choice_id = c.id
      WHERE a.user_id = ?
        AND NOT (s.ismanager = 1 AND s.for_manager_to_evaluate_employee = 1)
      GROUP BY ss.id, ss.title, s.title
      ORDER BY s.title, ss.title
      LIMIT 0, 25
    `, [userId]);

    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get employee results for a specific manager
exports.getEmployeeResultsForAspecificManager = async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await db.query(`
      SELECT 
        a.user_id,
        ss.id AS sub_section_id,
        ss.title AS sub_section_title,
        s.title AS section_title,
        COUNT(q.id) AS total_questions_answered,
        SUM(CASE WHEN c.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN sub_sections ss ON q.sub_section_id = ss.id
      JOIN sections s ON ss.section_id = s.id
      JOIN choices c ON a.choice_id = c.id
      WHERE a.user_id = (
        SELECT manager_id FROM users WHERE id = ?
      )
      AND s.ismanager = 1
      AND s.for_manager_to_evaluate_employee = 1
      GROUP BY ss.id, ss.title, s.title
      ORDER BY s.title, ss.title
      LIMIT 0, 25
    `, [userId]);

    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get sub-section results by a specific manager for a specific employee
exports.getSubSectionResultsManager = async (req, res) => {
  try {
    const { id: userId, target_user_id: targetUserId } = req.params;
    const [results] = await db.query(`
      SELECT 
        a.user_id AS manager_id,
        a.target_user_id AS employee_id,
        ss.id AS sub_section_id,
        ss.title AS sub_section_title,
        s.title AS section_title,
        COUNT(q.id) AS total_questions_answered,
        SUM(CASE WHEN c.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN sub_sections ss ON q.sub_section_id = ss.id
      JOIN sections s ON ss.section_id = s.id
      JOIN choices c ON a.choice_id = c.id
      WHERE a.user_id = ?
        AND a.target_user_id = ?
        AND s.ismanager = 1
        AND s.for_manager_to_evaluate_employee = 1
      GROUP BY a.user_id, a.target_user_id, ss.id, ss.title, s.title
      ORDER BY s.title, ss.title
      LIMIT 0, 25
    `, [userId, targetUserId]);

    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Final results (as employee and as manager)
exports.finalResults = async (req, res) => {
  try {
    const userId = req.params.id;
    const [results] = await db.query(`
      (
        SELECT 
          a.user_id,
          ss.id AS sub_section_id,
          ss.title AS sub_section_title,
          s.title AS section_title,
          COUNT(q.id) AS total_questions_answered,
          SUM(CASE WHEN c.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        JOIN sub_sections ss ON q.sub_section_id = ss.id
        JOIN sections s ON ss.section_id = s.id
        JOIN choices c ON a.choice_id = c.id
        WHERE a.user_id = ?
          AND NOT (s.ismanager = 1 AND s.for_manager_to_evaluate_employee = 1)
        GROUP BY ss.id, ss.title, s.title
      )
      UNION ALL
      (
        SELECT 
          a.user_id,
          ss.id AS sub_section_id,
          ss.title AS sub_section_title,
          s.title AS section_title,
          COUNT(q.id) AS total_questions_answered,
          SUM(CASE WHEN c.is_correct = 1 THEN 1 ELSE 0 END) AS correct_answers
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        JOIN sub_sections ss ON q.sub_section_id = ss.id
        JOIN sections s ON ss.section_id = s.id
        JOIN choices c ON a.choice_id = c.id
        WHERE a.user_id = (
          SELECT manager_id FROM users WHERE id = ?
        )
        AND s.ismanager = 1
        AND s.for_manager_to_evaluate_employee = 1
        GROUP BY ss.id, ss.title, s.title
      )
      ORDER BY section_title, sub_section_title
      LIMIT 0, 25
    `, [userId, userId]);

    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get question-level results
exports.getQuestionResults = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const [results] = await db.query(`
      SELECT 
        q.id AS question_id,
        q.text AS question_text,
        COUNT(a.id) AS total_answers,
        COALESCE(SUM(c.is_correct), 0) AS correct_answers,
        ROUND(
          CASE WHEN COUNT(a.id) = 0 THEN 0
               ELSE (COALESCE(SUM(c.is_correct), 0) / COUNT(a.id)) * 100
          END, 2) AS correct_percentage
      FROM sections s
      LEFT JOIN sub_sections ss ON ss.section_id = s.id
      LEFT JOIN questions q ON q.section_id = s.id OR q.sub_section_id = ss.id
      LEFT JOIN answers a ON a.question_id = q.id
      LEFT JOIN choices c ON a.choice_id = c.id
      WHERE s.id = ?
      GROUP BY q.id
      ORDER BY q.id DESC
    `, [sectionId]);

    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create new section
exports.createSection = async (req, res) => {
  try {
    const { title, ismanager = 0, for_manager_to_evaluate_employee = 0 } = req.body;
    const [result] = await db.query(
      'INSERT INTO sections (title, ismanager, for_manager_to_evaluate_employee) VALUES (?, ?, ?)',
      [title, ismanager, for_manager_to_evaluate_employee]
    );
    res.status(201).json({ id: result.insertId, title, ismanager, for_manager_to_evaluate_employee });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update section
exports.updateSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const { title, ismanager } = req.body;
    const [result] = await db.query(
      'UPDATE sections SET title = ?, ismanager = ? WHERE id = ?',
      [title, ismanager, sectionId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found' });
    res.json({ message: 'Section updated successfully' });
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const sectionId = req.params.id;
    const [result] = await db.query('DELETE FROM sections WHERE id = ?', [sectionId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Section not found' });
    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
