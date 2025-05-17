const db = require('../../config/db');

// Helper function to add full URLs to blog images
function addFullImageUrls(blog, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  if (blog.thumbnail) {
    blog.thumbnail = `${baseUrl}/uploads/${blog.thumbnail}`;
  }
  if (blog.banner) {
    blog.banner = `${baseUrl}/uploads/${blog.banner}`;
  }
  return blog;
}

// Function to get all blogs
exports.getBlogs = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM blogs');

    // Add full URLs for each blog
    const blogsWithUrls = results.map(blog => addFullImageUrls(blog, req));

    res.json(blogsWithUrls);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Function to get a single blog by ID
exports.getBlogById = async (req, res) => {
  const blogId = req.params.id;
  try {
    const [results] = await db.promise().query('SELECT * FROM blogs WHERE blog_id = ?', [blogId]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const blogWithUrls = addFullImageUrls(results[0], req);

    res.json(blogWithUrls);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
