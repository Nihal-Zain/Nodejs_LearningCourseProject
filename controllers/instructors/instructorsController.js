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

// Configure multer for image upload using Cloudinary
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
exports.uploadImage = upload.single('img');

// Get all instructors
exports.getAllInstructors = async (req, res) => {
  try {
    const [results] = await executeQuery('SELECT * FROM instructors');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Add a new instructor
exports.addInstructor = async (req, res) => {
  try {
    const { name, short_description } = req.body;
    const img = req.file ? req.file.path : null;

    if (!name || !short_description) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const sql = 'INSERT INTO instructors (name, img, short_description) VALUES (?, ?, ?)';
    const [result] = await executeQuery(sql, [name, img, short_description]);

    res.status(201).json({ message: 'Instructor created successfully', instructor: { name, img, short_description } });

  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// Get instructor by ID
exports.getInstructorById = async (req, res) => {
  const instructorId = req.params.id;
  try {
    const [results] = await executeQuery('SELECT * FROM instructors WHERE id = ?', [instructorId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update instructor (with optional image update)
exports.updateInstructor = async (req, res) => {
  try {
    const instructorId = req.params.id;
    const { name, short_description } = req.body;

    // Handle image update - only update if new file is uploaded
    const img = req.file ? req.file.path : undefined;

    // Build dynamic update query based on whether image is being updated
    let updateQuery, updateParams;
    
    if (img) {
      updateQuery = 'UPDATE instructors SET name = ?, short_description = ?, img = ? WHERE id = ?';
      updateParams = [name, short_description, img, instructorId];
    } else {
      updateQuery = 'UPDATE instructors SET name = ?, short_description = ? WHERE id = ?';
      updateParams = [name, short_description, instructorId];
    }

    const [result] = await executeQuery(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.json({ message: 'Instructor updated successfully' });
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// Delete instructor
exports.deleteInstructor = async (req, res) => {
  const instructorId = req.params.id;
  try {
    const [result] = await executeQuery('DELETE FROM instructors WHERE id = ?', [instructorId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json({ message: 'Instructor deleted successfully' });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
