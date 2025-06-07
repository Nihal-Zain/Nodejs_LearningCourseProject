const db = require('../../config/db');
const multer = require('multer');
const { storage } = require('../../middlewares/cloudinary');

// Helper function for database operations with retry logic
const executeQuery = async (query, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error(`Database query attempt ${i + 1} failed:`, error.message);

      // if (i === retries - 1) throw error;

      // if (
      //   ['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'ECONNREFUSED', 'ETIMEDOUT'].includes(error.code)
      // ) {
      //   await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
      // } else {
      //   throw error;
      // }
    }
  }
};

// Configure multer for image upload using Cloudinary
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Export the upload middleware for use in routes
exports.uploadImage = upload.single('img');

// GET all clients
exports.getAllClients = async (req, res) => {
  try {
    const [results] = await executeQuery('SELECT * FROM clients ORDER BY id DESC');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// GET client by ID
exports.getClientById = async (req, res) => {
  const clientId = req.params.id;
  try {
    const [results] = await executeQuery('SELECT * FROM clients WHERE id = ?', [clientId]);
    if (results.length === 0) return res.status(404).json({ error: 'Client not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// POST create client
exports.createClient = async (req, res) => {
  try {
    const { name, website } = req.body;
    const img_url = req.file ? req.file.path : null;

    const [result] = await executeQuery(
      'INSERT INTO clients (name, img_url, website) VALUES (?, ?, ?)',
      [name, img_url, website]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name, 
      img_url, 
      website 
    });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// PUT update client
exports.updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { name, website } = req.body;

    // Handle image update - only update if new file is uploaded
    const img_url = req.file ? req.file.path : undefined;

    // Build dynamic update query based on whether image is being updated
    let query, params;
    if (img_url) {
      query = 'UPDATE clients SET name = ?, website = ?, img_url = ? WHERE id = ?';
      params = [name, website, img_url, clientId];
    } else {
      query = 'UPDATE clients SET name = ?, website = ? WHERE id = ?';
      params = [name, website, clientId];
    }

    const [result] = await executeQuery(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client updated successfully' });
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// DELETE client
exports.deleteClient = async (req, res) => {
  const clientId = req.params.id;
  try {
    const [result] = await executeQuery('DELETE FROM clients WHERE id = ?', [clientId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
