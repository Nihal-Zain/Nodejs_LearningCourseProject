const express = require('express');
const router = express.Router();
const { getBlogs, getBlogById } = require('../controllers/blogs/blogsController');

router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);

module.exports = router;