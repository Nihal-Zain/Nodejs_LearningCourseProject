// controllers/instructorsController.js
const e = require('express');
const db = require('../../config/db');
const path = require('path');
require('dotenv').config();

exports.getAllInstructors = (req, res) => {
  db.query('SELECT * FROM instructors', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

exports.addInstructor = (req, res) => {
  const { name, short_description } = req.body;
  const PORT = process.env.PORT || 5000;
  const img = req.file
    ? `http://localhost:${PORT}/uploads/${req.file.filename}`
    : null;

  const sql =
    'INSERT INTO instructors (name, img, short_description) VALUES (?, ?, ?)';
  db.query(sql, [name, img, short_description], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name, img, short_description });
  });
};

exports.getInstructorById = (req, res) => {
  const instructorId = req.params.id;
  db.query(
    'SELECT * FROM instructors WHERE id = ?',
    [instructorId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(404).json({ error: 'Instructor not found' });
      res.json(results[0]);
    }
  );
};

//delete instructor
exports.deleteInstructor = (req, res) => {
  const instructorId = req.params.id;
  db.query(
    'DELETE FROM instructors WHERE id = ?',
    [instructorId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: 'Instructor not found' });
      res.json({ message: 'Instructor deleted successfully' });
    }
  );
};
//update instructor
exports.updateInstructor = (req, res) => {
  const instructorId = req.params.id;
  const { name, short_description, existingImg } = req.body;
  const PORT = process.env.PORT || 5000;

  const img = req.file
    ? `http://localhost:${PORT}/uploads/${req.file.filename}`
    : existingImg || null;

  const sql =
    'UPDATE instructors SET name = ?, img = ?, short_description = ? WHERE id = ?';
  db.query(sql, [name, img, short_description, instructorId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Instructor not found' });
    res.json({ message: 'Instructor updated successfully' });
  });
};
