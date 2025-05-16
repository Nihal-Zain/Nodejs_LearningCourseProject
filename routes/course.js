const express = require('express');
const router = express.Router();
const { getcourses, getSubCategories, getCourseById } = require('../controllers/course/courseController');

router.get('/courses', getcourses);
router.get('/courses/category/:category', getSubCategories);
router.get('/courses/id/:id', getCourseById); 

module.exports = router;
