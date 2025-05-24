const express = require('express');
const router = express.Router();
const {
  getCourses,
  getSubCategories,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllUniqueMainCategories,
} = require('../controllers/course/courseController');

// Get all courses
router.get('/courses', getCourses);

// Get sub-categories by category
router.get('/courses/category/:category', getSubCategories);

router.get('/subcategories/:category', getSubCategories);
// Get Unique Main Category
router.get('/courses/main-category',getAllUniqueMainCategories)
// Get course by id
router.get('/courses/id/:id', getCourseById);

// Add new course
router.post('/courses', addCourse);

// Update course by id
router.put('/courses/id/:id', updateCourse);

// Delete course by id
router.delete('/courses/id/:id', deleteCourse);

module.exports = router;
