const db = require('../../config/db');

// Gets All Category
exports.getCategory = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM category');
    res.json(results);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get Specifc Category by Name
exports.getCategoryByName = async(req,res) => {
   const categoryName = req.params.categoryName;
  try{
    const [result] = await db.query('SELECT * FROM `course` WHERE category = ?',[categoryName]);
    res.json(result);
  }catch(err){
    console.error('DB Query Error:', err);
    res.status(500).json({error: 'DB error'});
  }
}

// Get Specifc sub_category by Name
exports.getSubCategoryByName = async(req,res) => {
   const subCategoryName = req.params.subCategoryName;
  try{
    const [result] = await db.query('SELECT * FROM `course` WHERE sub_category = ?',[subCategoryName]);
    res.json(result);
  }catch(err){
    console.error('DB Query Error:', err);
    res.status(500).json({error: 'DB error'});
  }
}

// Add Category
exports.addCategory = async (req, res) => {
  const { code, name, slug, date_added } = req.body;  
  try {
    const [result] = await db.query(
      'INSERT INTO category (code, name, slug, date_added) VALUES (?, ?, ?, ?)', 
      [code, name, slug, date_added]
    );
    res.status(201).json({ id: result.insertId, code, name, slug, date_added });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: `Category code '${code}' already exists.` });
    }
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};



// Update Category
exports.updateCategory = async (req, res) => {
  const { code, name, slug } = req.body;
  const { id } = req.params;

  try {
    // Check for duplicate code in other categories
    const [existing] = await db.query(
      'SELECT id FROM category WHERE code = ? AND id != ?',
      [code, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: `Category code '${code}' already exists.` });
    }

    // Proceed with update
    const [result] = await db.query(
      'UPDATE category SET code = ?, name = ?, slug = ? WHERE id = ?',
      [code, name, slug, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ code, name, slug });
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};



// Delete Category
exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM category WHERE id = ?', [categoryId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};
