const express = require('express');
const router = express.Router();
const { getQuestionUser } = require('../controllers/question_user/questionUserController');

router.get('/question_user', getQuestionUser);

module.exports = router;

