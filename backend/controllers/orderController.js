const orderDao = require('../dao/orderDao');

// POST /api/orders/checkout
async function checkout(req, res) {
  try {
    const order = await orderDao.placeOrder(req.user.id);
    res.json(order);
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(400).json({ message: err.message });
  }
}

// GET /api/orders
async function getMyOrders(req, res) {
  try {
    const orders = await orderDao.getOrdersByUser(req.user.id);
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Error fetching order history' });
  }
}

module.exports = { checkout, getMyOrders };