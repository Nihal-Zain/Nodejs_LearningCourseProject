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
  getCompetencies,
  uploadThumbnail,
  getCompetenciesByCategory,
  getCourseByName
} = require('../controllers/course/courseController');

// Get all courses
router.get('/courses', getCourses);

// Get competencies from all courses' FAQs
router.get('/courses/competencies', getCompetencies);
router.get('/courses/competencies/:category', getCompetenciesByCategory);
// Get sub-categories by category
router.get('/courses/category/:category', getSubCategories);

router.get('/subcategories/:category', getSubCategories);
// Get Unique Main Category
router.get('/courses/main-category', getAllUniqueMainCategories);
// Get course by id
router.get('/courses/id/:id', getCourseById);
// Get Course by name
router.get('/courses/name/:name', getCourseByName);

// Add new course
router.post('/courses', uploadThumbnail, addCourse);

// Update course by id
router.put('/courses/id/:id', uploadThumbnail, updateCourse);

// Delete course by id
router.delete('/courses/id/:id', deleteCourse);

module.exports = router;
