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
    const [results] = await db.query(`SELECT 
  blogs.*, 
  users.first_name AS author_firstName,
  users.last_name AS authorLastName,
  users.email AS authorEmail
  FROM blogs
  JOIN users ON blogs.user_id = users.id;
`);

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
    const [results] = await db.query(`SELECT 
  blogs.*,
  users.first_name AS author_firstName,
  users.last_name AS author_lastName,
  users.email AS author_email
  FROM blogs
  JOIN users ON blogs.user_id = users.id
  WHERE blogs.blog_id = ?`, [blogId]);
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

// Create a new blog
exports.createBlog = async (req, res) => {
  const {
     title, 
     keywords,
    description
  } = req.body;

   const thumbnailPath = req.files.thumbnail?.[0]?.filename || null;
    const bannerPath = req.files.banner?.[0]?.filename || null;

  try {
    const [result] = await db.query(
      `INSERT INTO blogs (blog_category_id, user_id, title, keywords, description, thumbnail, banner, is_popular, likes, added_date, updated_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [1, 1, title, keywords, description, thumbnailPath, bannerPath, false, 0, 1]
    );
    res.status(201).json({ message: 'Blog created', blog_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  const blogId = req.params.id;
  try {
    const [result] = await db.query(
      'DELETE FROM blogs WHERE blog_id = ?',
      [blogId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};