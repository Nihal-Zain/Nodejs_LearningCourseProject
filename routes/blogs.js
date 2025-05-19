const express = require('express');
const router = express.Router();
const { getBlogs, getBlogById, createBlog } = require('../controllers/blogs/blogsController');
// const upload = require('../middlewares/upload');
const db = require('../config/db');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // or set up custom storage

// Existing routes
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);
router.post('/blogs', upload.fields([{ name: 'thumbnail' }, { name: 'banner' }]), createBlog);



module.exports = router;

