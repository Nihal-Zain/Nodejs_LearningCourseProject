const express = require('express');
const router = express.Router();
const { getBlogs, getBlogById, createBlog } = require('../controllers/blogs/blogsController');
const upload = require('../middlewares/upload');
const db = require('../config/db');

// Existing routes
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogById);
router.post('/blogs',createBlog)

//  New route for uploading banner image
router.post('/blogs/:id/banner', upload.single('banner'), async (req, res) => {
  const blogId = req.params.id;
  const bannerFilename = req.file?.filename;

  if (!bannerFilename) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    await db.promise().query(
      'UPDATE blogs SET banner = ?, updated_date = ? WHERE blog_id = ?',
      [bannerFilename, Math.floor(Date.now() / 1000), blogId]
    );
    res.json({ message: 'Banner updated successfully', banner: bannerFilename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database update failed' });
  }
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { getBlogs, getBlogById } = require('../controllers/blogs/blogsController');

// router.get('/blogs', getBlogs);
// router.get('/blogs/:id', getBlogById);

// module.exports = router;