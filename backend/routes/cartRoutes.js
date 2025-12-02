// backend/routes/cartRoutes.js

const express = require('express');
const router = express.Router();

// MUST import the auth function directly
const { authRequired } = require('../middleware/authMiddleware');

// Cart controller functions
const { getCart, addToCart, setItemQuantity } = require('../controllers/cartController');

// GET /api/cart
router.get('/', authRequired, getCart);

// POST /api/cart/add
router.post('/add', authRequired, addToCart);

// POST /api/cart/set  set absolute quantity
router.post('/set', authRequired, setItemQuantity);

module.exports = router;