// routes/organizationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  uploadLogo
} = require('../controllers/organizations/organizationController');

// Routes
router.get('/organizations', getAllOrganizations);
router.get('/organizations/:id', getOrganizationById);
router.post('/organizations', uploadLogo, createOrganization);
router.put('/organizations/:id', uploadLogo, updateOrganization);
router.delete('/organizations/:id', deleteOrganization);

module.exports = router;
