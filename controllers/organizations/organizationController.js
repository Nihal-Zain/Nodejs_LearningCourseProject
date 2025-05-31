const e = require('express');
const db = require('../../config/db');
const path = require('path');
require('dotenv').config();

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
  const PORT = process.env.PORT || 5000;
  const logo_image = req.file
    ? `http://localhost:${PORT}/uploads/${req.file.filename}`
    : null;

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
    if (results.length === 0)
      return res.status(404).json({ message: 'Organization not found' });
    res.json(results[0]);
  });
};
exports.updateOrganization = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const getOrgSql = 'SELECT logo_image FROM organizations WHERE id = ?';
  db.query(getOrgSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: 'Organization not found' });

    const existingLogo = results[0].logo_image;
    const PORT = process.env.PORT || 5000;
    const newLogo = req.file
      ? `http://localhost:${PORT}/uploads/${req.file.filename}`
      : existingLogo;

    const updateSql =
      'UPDATE organizations SET title = ?, logo_image = ? WHERE id = ?';
    db.query(updateSql, [title, newLogo, id], (updateErr, updateResult) => {
      if (updateErr) return res.status(500).json({ error: updateErr });
      res.json({ message: 'Organization updated successfully' });
    });
  });
};

// Delete organization
exports.deleteOrganization = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM organizations WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Organization not found' });
    res.json({ message: 'Organization deleted successfully' });
  });
};
