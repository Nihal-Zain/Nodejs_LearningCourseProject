const db = require('../../config/db');
const multer = require('multer');
const { storage } = require('../../middlewares/cloudinary');

// Helper function for database operations with retry logic
const executeQuery = async (query, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error(`Database query attempt ${i + 1} failed:`, error.message);
      
      // if (i === retries - 1) {
      //   // Last attempt failed, throw the error
      //   throw error;
      // }
      
      // Check if it's a connection error that we should retry
      if (error.code === 'ECONNRESET' || 
          error.code === 'PROTOCOL_CONNECTION_LOST' || 
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT') {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      } else {
        // Non-connection error, don't retry
        // throw error;
      }
    }
  }
};

// Configure multer for thumbnail upload using Cloudinary
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Export the upload middleware for use in routes
exports.uploadThumbnail = upload.single('thumbnail');

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
    const params = [];    // Category filter
    if (category && category.trim() !== '') {
      conditions.push('category = ?');
      params.push(category.trim());
    }
    
    // Sub-category filter with improved debugging and handling
    if (sub_category && sub_category.trim() !== '') {
      const trimmedSubCategory = sub_category.trim();
      
      // Log subcategory value for debugging
      console.log('Filtering by subcategory:', trimmedSubCategory);
      console.log('Type of subcategory:', typeof trimmedSubCategory);
      
      // First try a case-insensitive exact match
      conditions.push('LOWER(sub_category) = LOWER(?)');
      params.push(trimmedSubCategory);
      
      // Add extra logging to help debug
      console.log('SQL condition added for subcategory:', conditions[conditions.length-1]);
    }
    
    // City/Location filter (supports comma-separated values in database)
    if (city && city.trim() !== '') {
      conditions.push('city LIKE ?');
      params.push(`%${city.trim()}%`);
    }

    // Duration filter (replacing the Level filter)
    if (level && level.trim() !== '') {
      // Assuming level parameter is reused for duration filtering
      const durationValue = level.trim().toLowerCase();
      
      // Log the duration filter for debugging
      console.log('Filtering by duration:', durationValue);
      
      // Handle text-based durations like "one week", "two weeks", etc.
      conditions.push('LOWER(duration) LIKE ?');
      params.push(`%${durationValue}%`);
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
    }    // Build the WHERE clause
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
    // Log the complete query for debugging
    console.log('SQL Conditions:', conditions);
    console.log('SQL Parameters:', params);
      
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM course ${whereClause}`;
    const [countResult] = await executeQuery(countQuery, params);
    const totalCourses = countResult[0].total;

    // Get courses with pagination
    const coursesQuery = `
      SELECT * FROM course 
      ${whereClause} 
      LIMIT ? OFFSET ?
    `;

    const [results] = await executeQuery(coursesQuery, [...params, limitNum, offset]);

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

    console.log('Getting subcategories for category:', category);

    const [results] = await db.query(
      'SELECT DISTINCT sub_category FROM course WHERE category = ? ORDER BY sub_category',
      [category]
    );
    
    console.log('Found subcategories:', results);
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

// Helper to slugify a string (e.g., "My Course Name" -> "my-course-name")
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing dashes
}

// Get course by name (slugified title)
exports.getCourseByName = async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: 'Course name is required' });

    // Get all courses and find by slugified title
    const [results] = await db.query('SELECT * FROM course');
    const course = results.find(
      (c) => slugify(c.title) === name // Only slugify the title
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
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
      duration // <-- Add this line
    } = req.body;

    // Get thumbnail URL from uploaded file
    const thumbnail = req.file ? req.file.path : null;

    // Convert to JSON strings if they are objects
    faqs = typeof faqs === 'object' ? JSON.stringify(faqs) : faqs;
    outcomes = typeof outcomes === 'object' ? JSON.stringify(outcomes) : outcomes;
    requirements = typeof requirements === 'object' ? JSON.stringify(requirements) : requirements;

    const [result] = await executeQuery(
      `INSERT INTO course 
       (code, title, short_description, description, language, category_id, category, sub_category_id, sub_category, price, level, status, course_type, city, faqs, outcomes, requirements, thumbnail, duration) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        thumbnail,
        duration // <-- Add this line
      ]
    );

    res.status(201).json({ 
      message: 'Course added successfully', 
      courseId: result.insertId,
      thumbnail: thumbnail 
    });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update course by ID
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('Update request for courseId:', courseId);
    console.log('Update body:', req.body);
    if (!courseId) return res.status(400).json({ error: 'Course ID is required' });

    // Check if req.body exists and has data
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Request body is empty or invalid');
      return res.status(400).json({ error: 'Request body is empty or invalid' });
    }

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
      duration // <-- Add this line
    } = req.body;

    // Handle thumbnail update - only update if new file is uploaded
    const thumbnail = req.file ? req.file.path : undefined;

    faqs = typeof faqs === 'object' ? JSON.stringify(faqs) : faqs;
    outcomes =
      typeof outcomes === 'object' ? JSON.stringify(outcomes) : outcomes;
    requirements =
      typeof requirements === 'object'
        ? JSON.stringify(requirements)
        : requirements;

    // Build dynamic update query based on whether thumbnail is being updated
    let updateQuery, updateParams;

    if (thumbnail) {
      updateQuery = `UPDATE course SET 
       code = ?, title = ?, short_description = ?, description = ?, language = ?, category = ?, category_id = ?, sub_category_id = ?, sub_category = ?, price = ?, level = ?, status = ?, course_type = ?, city = ?, faqs = ?, outcomes = ?, requirements = ?, thumbnail = ?, duration = ?
       WHERE id = ?`;
      updateParams = [
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
        thumbnail,
        duration, 
        courseId,
      ];
    } else {
      updateQuery = `UPDATE course SET 
       code = ?, title = ?, short_description = ?, description = ?, language = ?, category = ?, category_id = ?, sub_category_id = ?, sub_category = ?, price = ?, level = ?, status = ?, course_type = ?, city = ?, faqs = ?, outcomes = ?, requirements = ?, duration = ?
       WHERE id = ?`;
      updateParams = [
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
        duration, // <-- Add this line
        courseId,
      ];
    }

    console.log('Update query:', updateQuery);
    console.log('Update params:', updateParams);

    const [result] = await executeQuery(updateQuery, updateParams);

    console.log('Update result:', result);

    if (result.affectedRows === 0) {
      console.log('No course found to update.');
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

// Get unique competencies for a specific category
exports.getCompetenciesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Get all courses in the category with FAQs
    const [courses] = await db.query(
      'SELECT faqs FROM course WHERE category = ? AND faqs IS NOT NULL AND faqs != ""',
      [category]
    );

    // Extract unique competencies from FAQs
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