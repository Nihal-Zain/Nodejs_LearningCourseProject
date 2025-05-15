const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/question/questionsController');

router.get('/questions', getQuizResults);

module.exports = router;
