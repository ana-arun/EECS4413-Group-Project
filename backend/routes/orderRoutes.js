// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// POST /api/orders/checkout
// body: { shipping: { fullName, address, city, postalCode, country },
//         payment: { cardBrand, last4 } }
const orderDao = require('../dao/orderDao');
router.post('/checkout', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping, payment } = req.body;

    if (
      !shipping ||
      !shipping.fullName ||
      !shipping.address ||
      !shipping.city ||
      !shipping.postalCode ||
      !shipping.country
    ) {
      return res.status(400).json({ message: 'Shipping information is incomplete' });
    }

    if (!payment || !payment.cardBrand || !payment.last4) {
      return res.status(400).json({ message: 'Payment summary is incomplete' });
    }

    // simulate payment authorization: if last4 === '0000' treat as declined
    if (!payment || !payment.last4) {
      return res.status(400).json({ message: 'Payment summary is incomplete' });
    }

    if (String(payment.last4) === '0000') {
      return res.status(402).json({ message: 'Credit Card Authorization Failed.' });
    }

    // Optionally save billing info to user profile if requested
    try {
      if (req.body.saveBilling && req.user && req.user.id) {
        // Save billing metadata (cardBrand, last4, expMonth, expYear)
        await require('../dao/usersDao').updateUserById(req.user.id, { billing: payment });
      }
    } catch (e) {
      console.error('Failed to save billing info:', e);
    }

    // Delegate to DAO which validates inventory and decrements counts
    const savedOrder = await orderDao.placeOrder(userId, shipping, payment);

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error in checkout:', err);
    res.status(400).json({ message: err.message || 'Error during checkout' });
  }
});

// GET /api/orders – all orders of current user
router.get('/', authRequired, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.item')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error loading orders' });
  }
});

module.exports = router;

// ADMIN: GET /api/orders/admin - list all orders (admin only)
// optional query: user=USER_ID  item=ITEM_ID  from=YYYY-MM-DD  to=YYYY-MM-DD
router.get('/admin/all', authRequired, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    const { user, item, from, to } = req.query;
    const q = {};
    if (user) q.user = user;
    if (item) q['items.item'] = item;
    if (from || to) q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);

    const orders = await Order.find(q).populate('items.item').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});