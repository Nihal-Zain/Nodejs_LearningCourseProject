const db = require('../../config/db');

// Helper to generate full image URL
const getFullImageUrl = (req, filename) => {
  // If filename already looks like a full URL (e.g., from Cloudinary), return it as is
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;

  // Otherwise build local uploads URL
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// Get all instructors
exports.getAllInstructors = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM instructors');

    const updatedResults = results.map(instructor => {
      if (instructor.img) {
        instructor.img = getFullImageUrl(req, instructor.img);
      }
      return instructor;
    });

    res.json(updatedResults);
  } catch (err) {
    console.error('Get all instructors error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add a new instructor
exports.addInstructor = async (req, res) => {
  console.log('Add Instructor - Request body:', req.body);
  console.log('Add Instructor - Uploaded file:', req.file);

  const { name, short_description } = req.body;

  if (!name || !short_description) {
    return res.status(400).json({ error: 'Name and short_description are required' });
  }

  // Depending on your upload setup:
  // - If local upload with multer, use req.file.filename or req.file.path
  // - If Cloudinary or external, it might be req.file.url or req.file.path as full URL
  // Here we assume multer local upload with filename
  const img = req.file ? req.file.filename : null;

  const sql = 'INSERT INTO instructors (name, img, short_description) VALUES (?, ?, ?)';
  try {
    const [result] = await db.query(sql, [name, img, short_description]);
    res.status(201).json({ id: result.insertId, name, img: getFullImageUrl(req, img), short_description });
  } catch (err) {
    console.error('Add instructor DB Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get instructor by ID
exports.getInstructorById = async (req, res) => {
  const instructorId = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM instructors WHERE id = ?', [instructorId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const instructor = results[0];
    if (instructor.img) {
      instructor.img = getFullImageUrl(req, instructor.img);
    }

    res.json(instructor);
  } catch (err) {
    console.error('Get instructor by ID error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update instructor (with optional image update)
exports.updateInstructor = async (req, res) => {
  console.log('Update Instructor - Request body:', req.body);
  console.log('Update Instructor - Uploaded file:', req.file);

  const instructorId = req.params.id;
  const { name, short_description } = req.body;

  if (!name || !short_description) {
    return res.status(400).json({ error: 'Name and short_description are required' });
  }

  // Image filename if new image uploaded
  const imageFilename = req.file ? req.file.filename : null;

  let query = 'UPDATE instructors SET name = ?, short_description = ?';
  let params = [name, short_description];

  if (imageFilename) {
    query += ', img = ?';
    params.push(imageFilename);
  }

  query += ' WHERE id = ?';
  params.push(instructorId);

  try {
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.json({
      message: 'Instructor updated successfully',
      id: instructorId,
      name,
      short_description,
      img: imageFilename ? getFullImageUrl(req, imageFilename) : undefined
    });
  } catch (err) {
    console.error('Update instructor DB Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete instructor
exports.deleteInstructor = async (req, res) => {
  const instructorId = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM instructors WHERE id = ?', [instructorId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json({ message: 'Instructor deleted successfully' });
  } catch (err) {
    console.error('Delete instructor error:', err);
    res.status(500).json({ error: err.message });
  }
};
