const db = require('../../config/db');

// Get all courses with filters and pagination
exports.getCourses = async (req, res) => {
  try {
    // Extract query parameters
    const {
      category,
      sub_category,
      city,
      level,
      search,
      page = 1,
      limit = 25,
    } = req.query;

    // Convert page and limit to integers
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 25;
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause conditions
    const conditions = [];
    const params = [];

    // Category filter
    if (category && category.trim() !== '') {
      conditions.push('category = ?');
      params.push(category.trim());
    }

    // Sub-category filter
    if (sub_category && sub_category.trim() !== '') {
      conditions.push('sub_category = ?');
      params.push(sub_category.trim());
    }

    // City/Location filter
    if (city && city.trim() !== '') {
      conditions.push('city = ?');
      params.push(city.trim());
    }

    // Level filter
    if (level && level.trim() !== '') {
      const levelValue = level.trim().toLowerCase();
      if (levelValue === 'beginner') {
        conditions.push('LOWER(level) = ?');
        params.push('beginner');
      } else {
        conditions.push('LOWER(level) != ?');
        params.push('beginner');
      }
    }

    // Search filter (searches in title, city, and category)
    if (search && search.trim() !== '') {
      conditions.push('(title LIKE ? OR city LIKE ? OR category LIKE ?)');
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Build the WHERE clause
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM course ${whereClause}`;
    const [countResult] = await db.promise().query(countQuery, params);
    const totalCourses = countResult[0].total;

    // Get courses with pagination
    const coursesQuery = `
      SELECT * FROM course 
      ${whereClause} 
      LIMIT ? OFFSET ?
    `;

    const [results] = await db
      .promise()
      .query(coursesQuery, [...params, limitNum, offset]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCourses / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Return response with pagination metadata
    res.json({
      courses: results,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCourses,
        limit: limitNum,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        category,
        sub_category,
        city,
        level,
        search,
      },
    });
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get distinct sub-categories for a category
exports.getSubCategories = async (req, res) => {
  try {
    const [results] = await db
      .promise()
      .query('SELECT DISTINCT sub_category FROM course WHERE category = ?', [
        req.params.category,
      ]);
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get distinct sub-categories for a category
exports.getAllUniqueMainCategories = async (req, res) => {
  try {
    const [results] = await db
      .promise()
      .query('SELECT DISTINCT category FROM `course`');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const [results] = await db
      .promise()
      .query('SELECT * FROM course WHERE id = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Add new course

exports.addCourse = async (req, res) => {
  let {
    code,
    title,
    short_description,
    description,
    language,
    category_id,
    category,
    sub_category_id,
    sub_category,
    price,
    level,
    status,
    course_type,
    city,
    faqs,
    outcomes,
    requirements,
  } = req.body;

  try {
    // Ensure any objects are stringified
    faqs = typeof faqs === 'object' ? JSON.stringify(faqs) : faqs;
    outcomes =
      typeof outcomes === 'object' ? JSON.stringify(outcomes) : outcomes;
    requirements =
      typeof requirements === 'object'
        ? JSON.stringify(requirements)
        : requirements;

    const [result] = await db.promise().query(
      `INSERT INTO course 
       (code, title, short_description, description, language, category_id, category, sub_category_id, sub_category, price, level, status, course_type, city, faqs, outcomes, requirements) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        title,
        short_description,
        description,
        language,
        category_id,
        category,
        sub_category_id,
        sub_category,
        price,
        level,
        status,
        course_type,
        city,
        faqs,
        outcomes,
        requirements,
      ]
    );
    res.status(201).json({
      message: 'Course added successfully',
      courseId: result.insertId,
    });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update course by ID

exports.updateCourse = async (req, res) => {
  const courseId = req.params.id;
  let {
    code,
    title,
    short_description,
    description,
    language,
    category,
    category_id,
    sub_category_id,
    sub_category,
    price,
    level,
    status,
    course_type,
    city,
    faqs,
    outcomes,
    requirements,
  } = req.body;

  try {
    // Convert objects to JSON strings if needed
    faqs = typeof faqs === 'object' ? JSON.stringify(faqs) : faqs;
    outcomes =
      typeof outcomes === 'object' ? JSON.stringify(outcomes) : outcomes;
    requirements =
      typeof requirements === 'object'
        ? JSON.stringify(requirements)
        : requirements;

    const [result] = await db.promise().query(
      `UPDATE course SET 
       code = ?, title = ?, short_description = ?, description = ?, language = ?, category = ?, category_id = ?, sub_category_id = ?, sub_category = ?, price = ?, level = ?, status = ?, course_type = ?, city = ?, faqs = ?, outcomes = ?, requirements = ?
       WHERE id = ?`,
      [
        code,
        title,
        short_description,
        description,
        language,
        category,
        category_id,
        sub_category_id,
        sub_category,
        price,
        level,
        status,
        course_type,
        city,
        faqs,
        outcomes,
        requirements,
        courseId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course updated successfully' });
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete course by ID
exports.deleteCourse = async (req, res) => {
  const courseId = req.params.id;
  try {
    const [result] = await db
      .promise()
      .query('DELETE FROM course WHERE id = ?', [courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
