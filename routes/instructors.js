const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructors/instructorsController');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

//Use middleware directly without manual wrapping
router.get('/instructors', instructorController.getAllInstructors);
router.post('/instructors', upload.single('img'), instructorController.addInstructor);
router.get('/instructors/:id', instructorController.getInstructorById);
router.delete('/instructors/:id', instructorController.deleteInstructor);
router.put('/instructors/:id', upload.single('img'), instructorController.updateInstructor);


module.exports = router;
