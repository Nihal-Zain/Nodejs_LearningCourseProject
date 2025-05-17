const db = require('../../config/db');

// Fetch All Courses
exports.getcourses = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM course');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Fetch unique subCategory to filter by it
exports.getSubCategories = async(req,res) =>{
  try {
    const [results] = await db.promise().query('SELECT DISTINCT(sub_category) FROM `course` WHERE category = ?', [req.params.category]);
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
}

// fetch course by ID
exports.getCourseById = async (req, res) => {
  const courseId = req.params.id;
  try {
    const [results] = await db.promise().query('SELECT * FROM course WHERE id=?', [courseId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
}
