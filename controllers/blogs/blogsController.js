const db = require('../../config/db');

// Function to get all blogs
exports.getBlogs = async (req, res) => {
    try {
        const [results] = await db.promise().query('SELECT * FROM blogs');
        res.json(results);
    } catch (err) {
        console.error('DB Query Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
}

// Function to get a single blog by ID
exports.getBlogById = async (req, res) => {
    const blogId = req.params.id;
    try {
        const [results] = await db.promise().query('SELECT * FROM blogs WHERE blog_id = ?', [blogId]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('DB Query Error:', err);
        res.status(500).json({ error: 'Database error' });
    }
}