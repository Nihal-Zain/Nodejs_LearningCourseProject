// controllers/organizations/organizationController.js
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
      
      // if (i === retries - 1) {
      //   // Last attempt failed, throw the error
      //   throw error;
      // }
      
      // Check if it's a connection error that we should retry
      if (error.code === 'ECONNRESET' || 
          error.code === 'PROTOCOL_CONNECTION_LOST' || 
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT') {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      } else {
        // Non-connection error, don't retry
        // throw error;
      }
    }
  }
};

// Configure multer for logo upload using Cloudinary
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
exports.uploadLogo = upload.single('logo_image');

// Get all organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    const [results] = await executeQuery("SELECT * FROM organizations");
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Create new organization
exports.createOrganization = async (req, res) => {
  try {
    const { title } = req.body;
    const logo_image = req.file ? req.file.path : null;

    const [result] = await executeQuery(
      'INSERT INTO organizations (title, logo_image) VALUES (?, ?)',
      [title, logo_image]
    );

    res.status(201).json({ 
      id: result.insertId, 
      title, 
      logo_image 
    });
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};


// Get organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await executeQuery(
      "SELECT * FROM organizations WHERE id = ?",
      [id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    // Handle logo update - only update if new file is uploaded
    const logo_image = req.file ? req.file.path : undefined;

    // Build dynamic update query based on whether logo is being updated
    let updateQuery, updateParams;
    
    if (logo_image) {
      updateQuery = "UPDATE organizations SET title = ?, logo_image = ? WHERE id = ?";
      updateParams = [title, logo_image, id];
    } else {
      updateQuery = "UPDATE organizations SET title = ? WHERE id = ?";
      updateParams = [title, id];
    }

    const [result] = await executeQuery(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ message: "Organization updated successfully" });
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete organization
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await executeQuery("DELETE FROM organizations WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({ message: "Organization deleted successfully" });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
