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
      faqs,
      competencies,
      minPrice,
      maxPrice,
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

    // City/Location filter (supports comma-separated values in database)
    if (city && city.trim() !== '') {
      conditions.push('city LIKE ?');
      params.push(`%${city.trim()}%`);
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

    // FAQs/Competencies filter
    const competenciesFilter = competencies || faqs; // Support both parameter names
    if (competenciesFilter) {
      let competenciesArray;

      // Handle different input formats
      if (typeof competenciesFilter === 'string') {
        try {
          // Parse JSON string and decode URL-encoded characters
          competenciesArray = JSON.parse(
            decodeURIComponent(competenciesFilter)
          );
        } catch {
          // If JSON parsing fails, treat as comma-separated string
          competenciesArray = competenciesFilter
            .split(',')
            .map((c) => c.trim());
        }
      } else if (Array.isArray(competenciesFilter)) {
        competenciesArray = competenciesFilter;
      }

      if (competenciesArray && competenciesArray.length > 0) {
        const faqConditions = competenciesArray
          .map(() => 'JSON_EXTRACT(faqs, CONCAT("$.", ?)) IS NOT NULL')
          .join(' OR ');
        conditions.push(`(${faqConditions})`);
        competenciesArray.forEach((competency) => {
          // Clean up the competency name (remove + signs and extra spaces)
          const cleanCompetency = competency.replace(/\+/g, ' ').trim();
          params.push(cleanCompetency);
        });
      }
    }

    // Price filter
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      conditions.push('price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      conditions.push('price <= ?');
      params.push(parseFloat(maxPrice));
    }

    // Build the WHERE clause
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM course ${whereClause}`;
    const [countResult] = await db.query(countQuery, params);
    const totalCourses = countResult[0].total;

    // Get courses with pagination
    const coursesQuery = `
      SELECT * FROM course 
      ${whereClause} 
      LIMIT ? OFFSET ?
    `;

    const [results] = await db
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
        faqs,
        minPrice,
        maxPrice,
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
    const category = req.params.category;
    if (!category) return res.status(400).json({ error: 'Category is required' });

    const [results] = await db.query(
      'SELECT DISTINCT sub_category FROM course WHERE category = ?',
      [category]
    );
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get all unique main categories
exports.getAllUniqueMainCategories = async (req, res) => {
  try {
    const [results] = await db.query('SELECT DISTINCT category FROM course');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!courseId) return res.status(400).json({ error: 'Course ID is required' });

    const [results] = await db.query('SELECT * FROM course WHERE id = ?', [courseId]);

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
  try {
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

    // Convert to JSON strings if they are objects
    faqs = typeof faqs === 'object' ? JSON.stringify(faqs) : faqs;
    outcomes =
      typeof outcomes === 'object' ? JSON.stringify(outcomes) : outcomes;
    requirements =
      typeof requirements === 'object'
        ? JSON.stringify(requirements)
        : requirements;

    const [result] = await db.query(
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

    res.status(201).json({ message: 'Course added successfully', courseId: result.insertId });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update course by ID
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    if (!courseId) return res.status(400).json({ error: 'Course ID is required' });

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

    faqs = typeof faqs === 'object' ? JSON.stringify(faqs) : faqs;
    outcomes =
      typeof outcomes === 'object' ? JSON.stringify(outcomes) : outcomes;
    requirements =
      typeof requirements === 'object'
        ? JSON.stringify(requirements)
        : requirements;

    const [result] = await db.query(
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
  try {
    const courseId = req.params.id;
    if (!courseId) return res.status(400).json({ error: 'Course ID is required' });

    const [result] = await db.query('DELETE FROM course WHERE id = ?', [courseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get unique competencies from all courses' FAQs
exports.getCompetencies = async (req, res) => {
  try {
    // Get all courses with FAQs
    const [courses] = await db
      .query('SELECT faqs FROM course WHERE faqs IS NOT NULL AND faqs != ""');

    // Extract competencies from FAQs
    const competencies = Array.from(
      new Set(
        courses.flatMap((course) => {
          try {
            const faqsObj =
              typeof course.faqs === 'string'
                ? JSON.parse(course.faqs)
                : course.faqs;
            return faqsObj ? Object.keys(faqsObj) : [];
          } catch {
            return [];
          }
        })
      )
    );

    res.json(competencies);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
