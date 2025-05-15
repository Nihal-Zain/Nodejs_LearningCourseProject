const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/question_user/questionUserController');

router.get('/question_user', getQuizResults);

module.exports = router;

