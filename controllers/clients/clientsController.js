const db = require('../../config/db');

// Helper to generate full URL
const getFullImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM clients ORDER BY id DESC');
    const updatedResults = results.map(client => {
      if (client.img_url) {
        client.img_url = getFullImageUrl(req, client.img_url);
      }
      return client;
    });
    res.json(updatedResults);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  const clientId = req.params.id;
  try {
    const [results] = await db.query('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const client = results[0];
    if (client.img_url) {
      client.img_url = getFullImageUrl(req, client.img_url);
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new client with single image
exports.createClient = async (req, res) => {
  const { name, website } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const imageFilename = req.file.filename;

  try {
    const [result] = await db.query(
      'INSERT INTO clients (name, img_url, website) VALUES (?, ?, ?)',
      [name, imageFilename, website]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      website,
      img_url: getFullImageUrl(req, imageFilename)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update client (with optional image update)
exports.updateClient = async (req, res) => {
  const clientId = req.params.id;
  const { name, website } = req.body;
  const imageFilename = req.file?.filename;

  let query = 'UPDATE clients SET name = ?, website = ?';
  let params = [name, website];

  if (imageFilename) {
    query += ', img_url = ?';
    params.push(imageFilename);
  }

  query += ' WHERE id = ?';
  params.push(clientId);

  try {
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({
      id: clientId,
      name,
      website,
      img_url: imageFilename ? getFullImageUrl(req, imageFilename) : undefined
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  const clientId = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM clients WHERE id = ?', [clientId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
