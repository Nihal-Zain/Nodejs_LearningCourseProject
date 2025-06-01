const db = require('.././../config/db');

// Create user_info
exports.createUserInfo = async (req, res) => {
  const {
    user_id,
    full_name,
    email,
    mobile_number,
    current_position,
    years_in_same_position,
    years_in_organization,
    previous_position,
    studying_same_as_work,
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO user_info (
      user_id,  
      full_name, 
        email, 
        mobile_number, 
        current_position, 
        years_in_same_position, 
        years_in_organization, 
        previous_position, 
        studying_same_as_work
      ) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id ?? null,
        full_name ?? null,
        email ?? null,
        mobile_number ?? null,
        current_position ?? null,
        years_in_same_position ?? null,
        years_in_organization ?? null,
        previous_position ?? null,
        studying_same_as_work ?? null
      ]
    );

    res.status(201).json({ message: 'User info created', id: result.insertId });
  } catch (err) {
    console.error('Error creating user info:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Read all user_info
exports.getAllUserInfo = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM user_info`);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Read one user_info by ID
exports.getUserInfoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`SELECT * FROM user_info WHERE user_id = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user info by ID:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update user_info
exports.updateUserInfo = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get current user_info
    const [rows] = await db.query(`SELECT * FROM user_info WHERE id = ?`, [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'User info not found' });

    const existing = rows[0];

    // 2. Use new value or fall back to existing one
    const {
      user_id = existing.user_id,
      full_name = existing.full_name,
      email = existing.email,
      mobile_number = existing.mobile_number,
      current_position = existing.current_position,
      years_in_same_position = existing.years_in_same_position,
      years_in_organization = existing.years_in_organization,
      previous_position = existing.previous_position,
      studying_same_as_work = existing.studying_same_as_work,
    } = req.body;

    // 3. Update only the changed/new values
    await db.query(
      `UPDATE user_info SET 
        user_id = ?,
        full_name = ?, 
        email = ?, 
        mobile_number = ?, 
        current_position = ?, 
        years_in_same_position = ?, 
        years_in_organization = ?, 
        previous_position = ?, 
        studying_same_as_work = ?
      WHERE id = ?`,
      [
        user_id,
        full_name,
        email,
        mobile_number,
        current_position,
        years_in_same_position,
        years_in_organization,
        previous_position,
        studying_same_as_work,
        id
      ]
    );

    res.json({ message: 'User info updated' });
  } catch (err) {
    console.error('Error updating user info:', err);
    res.status(500).json({ error: 'Database error' });
  }
};


// Delete user_info
exports.deleteUserInfo = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM user_info WHERE id = ?`, [id]);
    res.json({ message: 'User info deleted' });
  } catch (err) {
    console.error('Error deleting user info:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
