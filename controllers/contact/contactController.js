// controllers/contactController.js
const e = require('express');
const db = require('../../config/db');
const path = require('path');

// Get all contacts
exports.getAllContacts = (req, res) => {
  db.query('SELECT * FROM contact_info', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Get one contact
exports.getContactById = (req, res) => {
  db.query('SELECT * FROM contact_info WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
};

// Create new contact
exports.createContact = (req, res) => {
  const { name, email, phone, address } = req.body;
  db.query('INSERT INTO contact_info (name, email, phone, address) VALUES (?, ?, ?, ?)',
    [name, email, phone, address],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Contact created!', id: result.insertId });
    });
};

// Update contact
exports.updateContact = (req, res) => {
  const { name, email, phone, address } = req.body;
  db.query('UPDATE contact_info SET name=?, email=?, phone=?, address=? WHERE id=?',
    [name, email, phone, address, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Contact updated!' });
    });
};

// Delete contact
exports.deleteContact = (req, res) => {
  db.query('DELETE FROM contact_info WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Contact deleted!' });
  });
};
