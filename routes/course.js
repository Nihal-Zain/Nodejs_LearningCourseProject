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

// Debug endpoint for duration filtering issues
router.get('/courses/debug-duration', async (req, res) => {
  try {
    const { duration } = req.query;
    console.log('DEBUG - Received duration query:', duration);
    
    const db = require('../config/db');
    
    // Get all distinct duration values from database
    const [durations] = await db.query('SELECT DISTINCT duration FROM course WHERE duration IS NOT NULL');
    console.log('DEBUG - All durations in DB:', durations.map(d => d.duration));
    
    // Test exact match (case-sensitive)
    const [exactMatches] = await db.query('SELECT id, title, duration FROM course WHERE duration = ?', [duration]);
    console.log('DEBUG - Exact matches (case-sensitive):', exactMatches.length);
    
    // Test case-insensitive match
    const [caseInsensitiveMatches] = await db.query('SELECT id, title, duration FROM course WHERE LOWER(duration) = LOWER(?)', [duration]);
    console.log('DEBUG - Case-insensitive matches:', caseInsensitiveMatches.length);
    
    res.json({
      query: duration,
      allDurations: durations.map(d => d.duration),
      exactMatches,
      caseInsensitiveMatches
    });
  } catch (err) {
    console.error('Debug endpoint error:', err);
    res.status(500).json({ error: 'Debug endpoint failed', message: err.message });
  }
});

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
