const express = require('express');
const router = express.Router();
const { getQuestion } = require('../controllers/question/questionsController');

router.get('/question', getQuestion);

module.exports = router;
