const e = require('express');
const db = require('../../config/db');
const path = require('path');

const getFullImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

exports.getAllClients = async (req, res) => {
  const query = 'SELECT * FROM clients ORDER BY id DESC';
  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClientById = async (req, res) => {
  const clientId = req.params.id;
  const query = 'SELECT * FROM clients WHERE id = ?';
  try {
    const [results] = await db.query(query, [clientId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createClient = async (req, res) => {
  const { name, website } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const img_url = getFullImageUrl(req, req.file.filename);
  const query = 'INSERT INTO clients (name, img_url, website) VALUES (?, ?, ?)';

  try {
    const [result] = await db.query(query, [name, img_url, website]);
    res.status(201).json({ id: result.insertId, name, img_url, website });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateClient = async (req, res) => {
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

  try {
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ id: clientId, name, website, img_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteClient = async (req, res) => {
  const clientId = req.params.id;
  const query = 'DELETE FROM clients WHERE id = ?';

  try {
    const [result] = await db.query(query, [clientId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
