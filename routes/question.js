const express = require('express');
const router = express.Router();
const { getQuestion } = require('../controllers/question/questionsController');

router.get('/questions', getQuestion);

module.exports = router;
