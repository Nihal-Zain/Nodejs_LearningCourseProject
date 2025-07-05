const db = require('../../config/db');
const path = require('path');

// Create a new country with image upload
exports.createCountry = async (req, res) => {
  try {
    const { title, description } = req.body;
    const country_image = req.file ? req.file.filename : null;

    const query = 'INSERT INTO countries (country_image, title, description) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [country_image, title, description]);

    res.status(201).json({
      id: result.insertId,
      country_image,
      title,
      description
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get all countries
exports.getAllCountries = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM countries ORDER BY id DESC');

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;

    const countriesWithFullImagePath = results.map(country => ({
      ...country,
      country_image_url: country.country_image
        ? `${baseUrl}/${country.country_image}`
        : null
    }));

    res.json(countriesWithFullImagePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get country by ID
exports.getCountryById = async (req, res) => {
  try {
    const countryId = req.params.id;
    const [results] = await db.query('SELECT * FROM countries WHERE id = ?', [countryId]);

    if (results.length === 0)
      return res.status(404).json({ error: 'Country not found' });

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
    const country = results[0];

    res.json({
      ...country,
      country_image_url: country.country_image
        ? `${baseUrl}/${country.country_image}`
        : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update country by ID
exports.updateCountry = async (req, res) => {
  try {
    const countryId = req.params.id;
    const { country_image, title, description } = req.body;
    const [result] = await db.query(
      'UPDATE countries SET country_image = ?, title = ?, description = ? WHERE id = ?',
      [country_image, title, description, countryId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: 'Country updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete country by ID
exports.deleteCountry = async (req, res) => {
  try {
    const countryId = req.params.id;
    const [result] = await db.query('DELETE FROM countries WHERE id = ?', [countryId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: 'Country deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
