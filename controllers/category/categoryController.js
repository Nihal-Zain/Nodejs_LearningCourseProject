const db = require('../../config/db');

// Gets All Category
exports.getCategory = async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM category');
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
    const [result] = await db.promise().query('SELECT * FROM `course` WHERE category = ?',[categoryName]);
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
    const [result] = await db.promise().query('SELECT * FROM `course` WHERE sub_category = ?',[subCategoryName]);
    res.json(result);
  }catch(err){
    console.error('DB Query Error:', err);
    res.status(500).json({error: 'DB error'});
  }
}
