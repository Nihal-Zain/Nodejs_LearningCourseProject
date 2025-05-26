const e = require('express');
const db = require('../../config/db');
const path = require('path');


// Get all organizations
exports.getAllOrganizations = (req, res) => {
  db.query('SELECT * FROM organizations', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Add a new organization with uploaded image
exports.createOrganization = (req, res) => {
  const { title } = req.body;
  const logo_image = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

  const sql = 'INSERT INTO organizations (title, logo_image) VALUES (?, ?)';
  db.query(sql, [title, logo_image], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ id: result.insertId, title, logo_image });
  });
};

// Get organization by ID
exports.getOrganizationById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM organizations WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Organization not found' });
    res.json(results[0]);
  });
};

// Update organization
exports.updateOrganization = (req, res) => {
  const { id } = req.params;
  const { title, existingLogo } = req.body;

  const logo_image = req.file
    ? `http://localhost:5000/uploads/${req.file.filename}`
    : existingLogo || null;

  const sql = 'UPDATE organizations SET title = ?, logo_image = ? WHERE id = ?';
  db.query(sql, [title, logo_image, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Organization not found' });
    res.json({ message: 'Organization updated successfully' });
  });
};

// Delete organization
exports.deleteOrganization = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM organizations WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Organization not found' });
    res.json({ message: 'Organization deleted successfully' });
  });
};