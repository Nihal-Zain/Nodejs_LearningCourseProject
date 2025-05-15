const express = require('express');
const router = express.Router();
const { getcourses } = require('../controllers/course/courseController');

router.get('/courses', getcourses);

module.exports = router;
