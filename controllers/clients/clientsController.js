// controllers/clientsController.js
const e = require('express');
const db = require('../../config/db');
const path = require('path');

const getFullImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

exports.getAllClients = (req, res) => {
  const query = 'SELECT * FROM clients ORDER BY id DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getClientById = (req, res) => {
  const clientId = req.params.id;
  const query = 'SELECT * FROM clients WHERE id = ?';
  db.query(query, [clientId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json(results[0]);
  });
};

exports.createClient = (req, res) => {
  const { name, website } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const img_url = getFullImageUrl(req, req.file.filename);

  const query = 'INSERT INTO clients (name, img_url, website) VALUES (?, ?, ?)';
  db.query(query, [name, img_url, website], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({ id: result.insertId, name, img_url, website });
  });
};

exports.updateClient = (req, res) => {
  const clientId = req.params.id;
  const { name, website } = req.body;

  let img_url = null;
  if (req.file) {
    img_url = getFullImageUrl(req, req.file.filename);
  }

  let query = 'UPDATE clients SET name = ?, website = ?';
  let params = [name, website];

  if (img_url) {
    query += ', img_url = ?';
    params.push(img_url);
  }

  query += ' WHERE id = ?';
  params.push(clientId);

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Client not found' });

    res.json({ id: clientId, name, website, img_url });
  });
};

exports.deleteClient = (req, res) => {
  const clientId = req.params.id;
  const query = 'DELETE FROM clients WHERE id = ?';
  db.query(query, [clientId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  });
};
