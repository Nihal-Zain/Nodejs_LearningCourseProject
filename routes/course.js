const express = require('express');
const router = express.Router();
const { getQuizResults } = require('../controllers/course/courseController');

router.get('/courses', getQuizResults);

module.exports = router;
