const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/quiz_results/quizResultsController');

router.get('/quiz_results', getQuizResults);

module.exports = router;
