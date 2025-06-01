const db = require('../../config/db');

exports.getEvaluationQuestions = async (req, res) => {
  const managerId = req.params.id; // Or req.user.id if using auth middleware
  const employeeId = req.params.employeeId;

  try {
    // Fetch all relevant questions
    const [questions] = await db.query(`
      SELECT q.id AS question_id, q.text, s.title AS section, ss.title AS sub_section
      FROM questions q
      JOIN sections s ON q.section_id = s.id
      JOIN sub_sections ss ON q.sub_section_id = ss.id
      WHERE q.target_type = 'manager_about_employee'
        AND s.for_manager_to_evaluate_employee = 1
    `);

    // Fetch all choices for those questions
    const [choices] = await db.query(`
      SELECT id, question_id, text, is_correct
      FROM choices
      WHERE question_id IN (?)
    `, [questions.map(q => q.question_id)]);

    // Fetch previous answers (if any)
    const [existingAnswers] = await db.query(`
      SELECT question_id, choice_id 
      FROM answers 
      WHERE user_id = ? AND target_user_id = ?
    `, [managerId, employeeId]);

    const answersMap = {};
    existingAnswers.forEach(a => {
      answersMap[a.question_id] = a.choice_id;
    });

    // Build the final structure
    const result = questions.map(q => ({
      questionId: q.question_id,
      text: q.text,
      section: q.section,
      subSection: q.sub_section,
      choices: choices
        .filter(c => c.question_id === q.question_id)
        .map(c => ({
          id: c.id,
          text: c.text,
          isCorrect: c.is_correct === 1
        })),
      selectedChoiceId: answersMap[q.question_id] || null
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.submitEvaluationAnswers = async (req, res) => {
  const managerId = req.params.id;
  const employeeId = req.params.employeeId;
  const answers = req.body.answers; // [{ question_id, choice_id }]

  try {
    for (const ans of answers) {
      const [existing] = await db.query(`
        SELECT id FROM answers 
        WHERE user_id = ? AND target_user_id = ? AND question_id = ?
      `, [managerId, employeeId, ans.question_id]);

      if (existing.length > 0) {
        // ✅ Use existing[0].id
        await db.query(`
          UPDATE answers 
          SET choice_id = ? 
          WHERE id = ?
        `, [ans.choice_id, existing[0].id]);
      } else {
        await db.query(`
          INSERT INTO answers (user_id, target_user_id, question_id, choice_id)
          VALUES (?, ?, ?, ?)
        `, [managerId, employeeId, ans.question_id, ans.choice_id]);
      }
    }

    res.json({ message: 'Answers saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save answers' });
  }
};
