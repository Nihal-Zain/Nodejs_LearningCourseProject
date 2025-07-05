const db = require('../../config/db');
const multer = require('multer');
const { storage } = require('../../middlewares/cloudinary');
require("dotenv").config();

// Helper function for database operations with retry logic
const executeQuery = async (query, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await db.query(query, params);
      return result;
    } catch (error) {
      console.error(`Database query attempt ${i + 1} failed:`, error.message);
      
      if (error.code === 'ECONNRESET' || 
          error.code === 'PROTOCOL_CONNECTION_LOST' || 
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT') {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      } else {
        // Non-connection error, don't retry
        throw error;
      }
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
exports.uploadImage = upload.single('country_image');

// Create a new country with image upload
exports.createCountry = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Get the Cloudinary URL from the uploaded file
    const country_image = req.file ? req.file.path : null;

    const query = 'INSERT INTO countries (country_image, title, description) VALUES (?, ?, ?)';
    const [result] = await executeQuery(query, [country_image, title, description]);

    res.status(201).json({
      id: result.insertId,
      country_image,
      title,
      description
    });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};


// Get all countries
exports.getAllCountries = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM countries ORDER BY id DESC');

    // No need to modify Cloudinary URLs - they are already complete URLs
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get country by ID
exports.getCountryById = async (req, res) => {
  try {
    const countryId = req.params.id;
    const [results] = await db.query('SELECT * FROM countries WHERE id = ?', [countryId]);

    if (results.length === 0)
      return res.status(404).json({ error: 'Country not found' });

    // Return the country with the Cloudinary URL
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update country by ID
exports.updateCountry = async (req, res) => {
  try {
    const countryId = req.params.id;
    const { title, description } = req.body;
    
    // Check if a new image was uploaded
    const country_image = req.file ? req.file.path : null;
    
    // First, get the current country data
    const [currentCountry] = await db.query('SELECT * FROM countries WHERE id = ?', [countryId]);
    
    if (currentCountry.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    // If no new image is uploaded, keep the existing one
    const imageToUpdate = country_image || currentCountry[0].country_image;
    
    const [result] = await db.query(
      'UPDATE countries SET country_image = ?, title = ?, description = ? WHERE id = ?',
      [imageToUpdate, title, description, countryId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    
    res.json({ 
      message: 'Country updated successfully',
      country: {
        id: countryId,
        country_image: imageToUpdate,
        title,
        description
      }
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// Delete country by ID
exports.deleteCountry = async (req, res) => {
  try {
    const countryId = req.params.id;
    const [result] = await db.query('DELETE FROM countries WHERE id = ?', [countryId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: 'Country deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
