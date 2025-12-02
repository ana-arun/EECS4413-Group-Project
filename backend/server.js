// server.js

// MongoDB connection string - use Docker MongoDB by default, or Atlas if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://admin:password123@mongodb:27017/eecs4413store?authSource=admin';
}

// JWT secret for auth (dev only)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'supersecret_eecs4413_store_123';
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const catalogRoutes = require('./routes/catalogRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes'); // NEW
const { insertSampleItems } = require('./dao/itemsDao');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const path = require('path');

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'EECS4413 backend is running ✅' });
});

// Routes
app.use('/api/items', catalogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes); // NEW

connectDB()
  .then(async () => {
    await insertSampleItems();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to DB error:', err);
  });