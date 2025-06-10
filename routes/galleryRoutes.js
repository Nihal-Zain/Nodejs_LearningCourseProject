// routes/galleryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadImage
} = require('../controllers/gallery/galleryController');

// Routes
router.get('/gallery', getAllGalleryItems);
router.get('/gallery/:id', getGalleryItemById);
router.post('/gallery', uploadImage, createGalleryItem);
router.put('/gallery/:id', uploadImage, updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);

module.exports = router;
