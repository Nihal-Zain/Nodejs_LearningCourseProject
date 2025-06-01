const db = require('../../config/db');

// Helper to generate full image URL
const getFullImageUrl = (req, filename) => {
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
    res.status(500).json({ error: err.message });
  }
};

// Add a new instructor
exports.addInstructor = async (req, res) => {
  const { name, short_description } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const imageFilename = req.file.filename;

  try {
    const [result] = await db.query(
      'INSERT INTO instructors (name, img, short_description) VALUES (?, ?, ?)',
      [name, imageFilename, short_description]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      img: getFullImageUrl(req, imageFilename),
      short_description
    });
  } catch (err) {
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
    res.status(500).json({ error: err.message });
  }
};

// Update instructor (with optional image update)
exports.updateInstructor = async (req, res) => {
  const instructorId = req.params.id;
  const { name, short_description } = req.body;
  const imageFilename = req.file?.filename;

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
    res.status(500).json({ error: err.message });
  }
};
