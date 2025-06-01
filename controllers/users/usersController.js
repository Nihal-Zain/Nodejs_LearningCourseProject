const db = require('../../config/db');

// LOGIN a user by id and password
exports.login = async (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'ID and password are required' });
  }

  try {
    const [rows] = await db.query(
      `SELECT 
        users.id AS user_id,
        users.first_name,
        users.last_name,
        users.email,
        users.role_id,
        role.name AS role_name,
        users.organization_id,
        users.assessment_completed,
        users.managerAssessment_completed,
        users.tips
      FROM users 
      INNER JOIN role ON users.role_id = role.id
      WHERE users.id = ? AND users.password = ?`,
      [id, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid ID or password' });
    }

    const user = rows[0];

    res.json({
      message: 'Login successful',
      user,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// get all users
exports.getUsers = async (req, res) => {
  try {
    const [results] = await db.query(`SELECT 
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

  try {
    const [result] = await db.query(sql, [orgId, targetRoles]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// CREATE a new user
exports.createUser = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    role_id,
    password,
    is_instructor,
    verification_code,
    manager_id,
    organization_id,
  } = req.body;

  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const [result] = await db
      .promise()
      .query(
        `INSERT INTO users (first_name, last_name, email, role_id, is_instructor, password, date_added, verification_code, manager_id, organization_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          last_name,
          email,
          role_id,
          is_instructor,
          password,
          currentTimestamp,
          verification_code,
          manager_id,
          organization_id,
        ]
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
  const fields = [
    'first_name',
    'last_name',
    'email',
    'password',
    'assessment_completed',
    'managerAssessment_completed',
    'tips',
  ];
  const updates = [];
  const values = [];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(userId);

  try {
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
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
    await db.query(`DELETE FROM users WHERE id = ?`, [userId]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getAllUsersUnderManager = async (req, res) => {
  const user_id = req.params.id;
  const organization_id = req.params.organization_id;

  try{
     const [results] = await db.query(`
      SELECT * FROM users WHERE manager_id = ? AND organization_id = ?;
  `,
      [user_id, organization_id]
    );
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// SAVE user tips
// In your usersController.js or wherever you handle saving tips:
exports.saveUserTips = async (req, res) => {
  const userId = req.params.id;
  const { tips } = req.body;

  if (typeof tips !== 'string' || tips.trim() === '') {
    return res.status(400).json({ error: 'Tips must be a non-empty string' });
  }

  try {
    // Assuming you use a SQL query to update user tips:
    await db.query('UPDATE users SET tips = ? WHERE id = ?', [tips, userId]);
    return res.json({ message: 'Tips saved successfully' });
  } catch (error) {
    console.error('Error saving tips:', error);
    return res.status(500).json({ error: 'Failed to save tips' });
  }
};

// Get tips for a user by user ID
exports.getTips = async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query('SELECT tips FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ tips: rows[0].tips || '' }); // Return empty string if null
  } catch (error) {
    console.error('Error fetching tips:', error);
    return res.status(500).json({ error: 'Failed to get tips' });
  }
};
