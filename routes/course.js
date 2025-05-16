const express = require('express');
const router = express.Router();
const { getcourses, getSubCategories } = require('../controllers/course/courseController');

router.get('/courses', getcourses);
router.get('/courses/:category', getSubCategories);

module.exports = router;
