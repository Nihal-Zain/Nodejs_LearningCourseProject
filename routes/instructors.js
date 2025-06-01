// routes/instructorRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const instructorController = require('../controllers/instructors/instructorsController');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Routes
router.get('/instructors', instructorController.getAllInstructors);
router.get('/instructors/:id', instructorController.getInstructorById);
router.post('/instructors', upload.single('img'), instructorController.addInstructor);
router.put('/instructors/:id', upload.single('img'), instructorController.updateInstructor);
router.delete('/instructors/:id', instructorController.deleteInstructor);

module.exports = router;
