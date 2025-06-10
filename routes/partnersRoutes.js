// routes/partnersRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  uploadLogo
} = require('../controllers/partners/partnersController');

// Routes
router.get('/partners', getAllPartners);
router.get('/partners/:id', getPartnerById);
router.post('/partners', uploadLogo, createPartner);
router.put('/partners/:id', uploadLogo, updatePartner);
router.delete('/partners/:id', deletePartner);

module.exports = router;
