const e = require('express');
const db = require('../../config/db');
const path = require('path');
require('dotenv').config();

exports.getAllInstructors = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM instructors');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addInstructor = async (req, res) => {
  const { name, short_description } = req.body;
  const PORT = process.env.PORT || 5000;
  const img = req.file
    ? `http://localhost:${PORT}/uploads/${req.file.filename}`
    : null;

  const sql = 'INSERT INTO instructors (name, img, short_description) VALUES (?, ?, ?)';
  try {
    const [result] = await db.query(sql, [name, img, short_description]);
    res.status(201).json({ id: result.insertId, name, img, short_description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInstructorById = async (req, res) => {
  const instructorId = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM instructors WHERE id = ?', [instructorId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.updateInstructor = async (req, res) => {
  const instructorId = req.params.id;
  const { name, short_description, existingImg } = req.body;
  const PORT = process.env.PORT || 5000;

  const img = req.file
    ? `http://localhost:${PORT}/uploads/${req.file.filename}`
    : existingImg || null;

  const sql = 'UPDATE instructors SET name = ?, img = ?, short_description = ? WHERE id = ?';
  try {
    const [result] = await db.query(sql, [name, img, short_description, instructorId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    res.json({ message: 'Instructor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
