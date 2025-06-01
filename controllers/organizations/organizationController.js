const db = require('../../config/db');
const path = require('path');
require('dotenv').config();

// Get all organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM organizations');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new organization with uploaded image
exports.createOrganization = async (req, res) => {
  try {
    const { title } = req.body;
    const PORT = process.env.PORT || 5000;
    const logo_image = req.file
      ? `http://localhost:${PORT}/uploads/${req.file.filename}`
      : null;

    const [result] = await db.query(
      'INSERT INTO organizations (title, logo_image) VALUES (?, ?)',
      [title, logo_image]
    );

    res.status(201).json({ id: result.insertId, title, logo_image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get organization by ID
exports.getOrganizationById = (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM organizations WHERE id = ?';
    db.query(sql, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(404).json({ message: 'Organization not found' });
      res.json(results[0]);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    // Get existing logo image first
    const [results] = await db.query('SELECT logo_image FROM organizations WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const existingLogo = results[0].logo_image;
    const PORT = process.env.PORT || 5000;
    const newLogo = req.file
      ? `http://localhost:${PORT}/uploads/${req.file.filename}`
      : existingLogo;

    await db.query('UPDATE organizations SET title = ?, logo_image = ? WHERE id = ?', [title, newLogo, id]);

    res.json({ message: 'Organization updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM organizations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ message: 'Organization deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
