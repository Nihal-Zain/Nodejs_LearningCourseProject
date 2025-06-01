// routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const organizationController = require('../controllers/organizations/organizationController');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// Routes
router.get('/organizations', organizationController.getAllOrganizations);
router.get('/organizations/:id', organizationController.getOrganizationById);
router.post('/organizations', upload.single('logo_image'), organizationController.createOrganization);
router.put('/organizations/:id', upload.single('logo_image'), organizationController.updateOrganization);
router.delete('/organizations/:id', organizationController.deleteOrganization);

module.exports = router;
