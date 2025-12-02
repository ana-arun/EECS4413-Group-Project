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
  console.log(`📊 Current item count: ${count}`);
  if (count > 0) {
    console.log('⏭️  Sample items already exist, skipping insert');
    return;
  }

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
      name: 'iPad Pro',
      description: 'A portable device for personal use',
      category: 'computer',
      brand: 'Apple',
      price: 500,
      quantity: 50,
      imageUrl: '/images/ipad.jpg'
    },
    {
      id: 'd001',
      name: 'Dell XPS Laptop',
      description: 'A laptop for personal use',
      category: 'computer',
      brand: 'Dell',
      price: 1500,
      quantity: 30,
      imageUrl: '/images/dell-laptop.jpg'
    },
    {
      id: 'e001',
      name: 'iPhone 15 Pro',
      description: 'Latest smartphone with advanced camera and A17 chip',
      category: 'phone',
      brand: 'Apple',
      price: 999,
      quantity: 75,
      imageUrl: '/images/iphone15.jpg'
    },
    {
      id: 'e002',
      name: 'Samsung Galaxy S24',
      description: 'Flagship Android phone with stunning display',
      category: 'phone',
      brand: 'Samsung',
      price: 899,
      quantity: 60,
      imageUrl: '/images/galaxy-s24.jpg'
    },
    {
      id: 'a001',
      name: 'AirPods Pro',
      description: 'Wireless earbuds with active noise cancellation',
      category: 'audio',
      brand: 'Apple',
      price: 249,
      quantity: 120,
      imageUrl: '/images/airpods-pro.jpg'
    },
    {
      id: 'a002',
      name: 'Sony WH-1000XM5',
      description: 'Premium noise-canceling over-ear headphones',
      category: 'audio',
      brand: 'Sony',
      price: 399,
      quantity: 45,
      imageUrl: '/images/sony-headphones.jpg'
    },
    {
      id: 'c002',
      name: 'MacBook Air M2',
      description: 'Lightweight laptop with Apple silicon',
      category: 'computer',
      brand: 'Apple',
      price: 1199,
      quantity: 35,
      imageUrl: '/images/macbook-air.jpg'
    },
    {
      id: 'c003',
      name: 'HP Pavilion Desktop',
      description: 'Powerful desktop computer for work and gaming',
      category: 'computer',
      brand: 'HP',
      price: 899,
      quantity: 25,
      imageUrl: '/images/hp-desktop.jpg'
    },
    {
      id: 'g001',
      name: 'Nintendo Switch',
      description: 'Portable gaming console with versatile play modes',
      category: 'gaming',
      brand: 'Nintendo',
      price: 299,
      quantity: 80,
      imageUrl: '/images/nintendo-switch.jpg'
    },
    {
      id: 'g002',
      name: 'PlayStation 5',
      description: 'Next-gen gaming console with 4K graphics',
      category: 'gaming',
      brand: 'Sony',
      price: 499,
      quantity: 40,
      imageUrl: '/images/ps5.jpg'
    },
    {
      id: 'w001',
      name: 'Apple Watch Series 9',
      description: 'Advanced fitness and health tracking smartwatch',
      category: 'wearable',
      brand: 'Apple',
      price: 399,
      quantity: 65,
      imageUrl: '/images/apple-watch.jpg'
    }
  ];

  await Item.insertMany(sampleData);
  console.log('✅ Sample items inserted into MongoDB');
}

module.exports = {
  getItems,
  insertSampleItems
};