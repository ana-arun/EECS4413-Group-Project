// controllers/catalogController.js

const { getItems } = require('../dao/itemsDao');

// GET /api/items
// Supports ?category=&brand=&sortBy=&sortOrder=&search=
async function getAllItems(req, res) {
  try {
    const { category, brand, sortBy, sortOrder, search } = req.query;

    const items = await getItems({
      category,
      brand,
      sortBy,
      sortOrder,
      search
    });

    res.json(items);
  } catch (err) {
    console.error('Error in getAllItems:', err);
    res.status(500).json({ message: 'Server error while fetching items' });
  }
}

module.exports = {
  getAllItems
};