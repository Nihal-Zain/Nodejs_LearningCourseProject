const db = require('../../config/db');

// get all users
exports.getUsers = async (req, res) => {
  try {
    const [results] = await db.promise().query(`SELECT 
  users.*,
  role.name AS Position
  FROM users
  INNER JOIN role ON users.role_id = role.id;
  `);
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// CREATE a new user
exports.createUser = async (req, res) => {
  const { first_name, last_name, email, role_id , is_instructor, verification_code} = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO users (first_name, last_name, email, role_id, is_instructor, date_added, verification_code) VALUES (?, ?, ?, ?, ?, NOW(),?)`,
      [first_name, last_name, email, role_id, is_instructor,  verification_code]
    );
    res.status(201).json({ message: 'User created', userId: result.insertId });
  } catch (err) {
    console.error('Create User Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// UPDATE a user by ID
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const {first_name, last_name, email } = req.body;

  try {
    await db.promise().query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?`,
      [first_name, last_name, email, userId]
    );
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('Update User Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE a user by ID
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await db.promise().query(`DELETE FROM users WHERE id = ?`, [userId]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};