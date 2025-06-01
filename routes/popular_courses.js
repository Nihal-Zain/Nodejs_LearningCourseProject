const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Add a course to popular courses
router.post('/popular-courses', async (req, res) => {
  const { course_id } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO popular_courses (course_id) VALUES (?)',
      [course_id]
    );
    res.status(201).json({ message: 'Course added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get all popular courses
router.get('/popular-courses', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT * FROM popular_courses JOIN course ON popular_courses.course_id = course.id'
    );
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a popular course
router.delete('/popular-courses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM popular_courses WHERE popular_id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send('Popular course not found');
    }
    res.status(200).send('Popular course deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
