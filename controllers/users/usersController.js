const db = require('../../config/db');

// get all users
exports.getUsers = async (req, res) => {
  try {
    const [results] = await db.promise().query(`SELECT 
  users.*, 
  role.name AS position,
  org.title AS organization_name,
  manager.first_name AS manager_first_name,
  manager.last_name AS manager_last_name
  FROM users
  INNER JOIN role ON users.role_id = role.id
  LEFT JOIN organizations AS org ON users.organization_id = org.id
  LEFT JOIN users AS manager ON users.manager_id = manager.id;
  `);
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};


exports.getAllManagerOfUsers = async (req, res) => {
  const { orgId, role } = req.query;

  let targetRoles = [];
  if (role === '5') {
    // If staff, get managers only
    targetRoles = [4];
  } else if (role === '4') {
    // If manager, get submanagers and above
    targetRoles = [3];
  } else {
    return res.json([]); // Return empty list for other roles
  }

  const sql = `
    SELECT id, first_name, last_name 
    FROM users 
    WHERE organization_id = ? AND role_id IN (?)`;

  db.query(sql, [orgId, targetRoles], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
};

// CREATE a new user
exports.createUser = async (req, res) => {
  const { first_name, last_name, email, role_id ,password, is_instructor, verification_code, manager_id, organization_id} = req.body;

  try {
    const [result] = await db.promise().query(
      `INSERT INTO users (first_name, last_name, email, role_id, is_instructor, password, date_added, verification_code, manager_id, organization_id) VALUES (?, ?, ?, ?,?, ?, NOW(),?,?,?)`,
      [first_name, last_name, email, role_id, is_instructor,password, verification_code, manager_id, organization_id]
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
  const {first_name, last_name, email, password } = req.body;

  try {
    await db.promise().query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ? WHERE id = ?`,
      [first_name, last_name, email, password, userId]
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