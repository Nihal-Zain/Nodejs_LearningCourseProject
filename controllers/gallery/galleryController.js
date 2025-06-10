// controllers/gallery/galleryController.js
const db = require("../../config/db");
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
exports.uploadImage = upload.single('image');

// Get all gallery items
exports.getAllGalleryItems = async (req, res) => {
  try {
    const [results] = await executeQuery("SELECT * FROM gallery ORDER BY id DESC");
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// Create new gallery item
exports.createGalleryItem = async (req, res) => {
  try {
    const { name, link } = req.body;
    const image = req.file ? req.file.path : null;

    const [result] = await executeQuery(
      'INSERT INTO gallery (name, image, link) VALUES (?, ?, ?)',
      [name, image, link]
    );

    res.status(201).json({ 
      id: result.insertId, 
      name,
      image,
      link
    });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// Get gallery item by ID
exports.getGalleryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await executeQuery(
      "SELECT * FROM gallery WHERE id = ?",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// Update gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link } = req.body;

    // Handle image update - only update if new file is uploaded
    const image = req.file ? req.file.path : undefined;

    // Build dynamic update query based on whether image is being updated
    let updateQuery, updateParams;
    
    if (image) {
      updateQuery = "UPDATE gallery SET name = ?, image = ?, link = ? WHERE id = ?";
      updateParams = [name, image, link, id];
    } else {
      updateQuery = "UPDATE gallery SET name = ?, link = ? WHERE id = ?";
      updateParams = [name, link, id];
    }

    const [result] = await executeQuery(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.json({ message: "Gallery item updated successfully" });
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await executeQuery("DELETE FROM gallery WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.json({ message: "Gallery item deleted successfully" });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error', message: err.message });
  }
};
