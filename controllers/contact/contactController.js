const e = require('express');
const db = require('../../config/db');
const path = require('path');

// Get all contacts
exports.getAllContacts = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM contact_info');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one contact
exports.getContactById = async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM contact_info WHERE id = ?', [req.params.id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new contact
exports.createContact = async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO contact_info (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );
    res.status(201).json({ message: 'Contact created!', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update contact
exports.updateContact = async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE contact_info SET name=?, email=?, phone=?, address=? WHERE id=?',
      [name, email, phone, address, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM contact_info WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
