// dao/itemsDao.js
// Uses MongoDB Item model for catalog queries

const Item = require('../models/Item');

// Get items with optional filters and sorting
async function getItems({ category, brand, sortBy, sortOrder, search }) {
  const query = {};

  // Filtering
  if (category) {
    query.category = category;
  }
  if (brand) {
    query.brand = brand;
  }

  // Basic text search on name + description
  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }

  // Sorting
  let sort = {};
  if (sortBy) {
    const order = sortOrder === 'desc' ? -1 : 1; // default asc
    if (sortBy === 'price') {
      sort.price = order;
    } else if (sortBy === 'name') {
      sort.name = order;
    }
  }

  // Apply query + sort
  const items = await Item.find(query).sort(sort);
  return items;
}

// Insert sample items if collection is empty
async function insertSampleItems() {
  const count = await Item.countDocuments();
  if (count > 0) return;

  const sampleData = [
    {
      id: 'b001',
      name: 'Little Prince',
      description: 'A book for all ages',
      category: 'book',
      brand: 'Penguin',
      price: 20,
      quantity: 100,
      imageUrl: '/images/little-prince.jpg'
    },
    {
      id: 'c001',
      name: 'iPad',
      description: 'A portable device for personal use',
      category: 'computer',
      brand: 'Apple',
      price: 500,
      quantity: 50,
      imageUrl: '/images/ipad.jpg'
    },
    {
      id: 'd001',
      name: 'Laptop',
      description: 'A laptop for personal use',
      category: 'computer',
      brand: 'Dell',
      price: 1500,
      quantity: 30,
      imageUrl: '/images/dell-laptop.jpg'
    }
  ];

  await Item.insertMany(sampleData);
  console.log('✅ Sample items inserted into MongoDB');
}

module.exports = {
  getItems,
  insertSampleItems
};