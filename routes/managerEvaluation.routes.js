const express = require('express');
const router = express.Router();
const managerEvaluationController = require('../controllers/managerQuestions/managersQuestionsController');

// Get questions for a manager to evaluate an employee
router.get('/manager/:id/:employeeId/questions', managerEvaluationController.getEvaluationQuestions);

// Submit answers from manager about employee
router.post('/manager/:id/:employeeId/answers', managerEvaluationController.submitEvaluationAnswers);

module.exports = router;
