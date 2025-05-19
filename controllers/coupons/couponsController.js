const db = require('../../config/db');

exports.getCoupons = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM coupons');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Add new coupon
exports.addCoupon = async (req, res) => {
  const { code, discount_percentage, created_at ,expiry_date } = req.body;

  try {
    const [result] = await db.promise().query(
      'INSERT INTO coupons (code, discount_percentage, created_at ,expiry_date) VALUES (?, ?, ?,?)',
      [code, discount_percentage, created_at ,expiry_date]
    );
    res.status(201).json({ id: result.insertId, code, discount_percentage, created_at,expiry_date });
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

//delete coupon
exports.deleteCoupon = async (req, res) => {
  const couponId = req.params.id;

  try {
    const [result] = await db.promise().query('DELETE FROM coupons WHERE id = ?', [couponId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

