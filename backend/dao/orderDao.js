const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Item = require('../models/Item');

// Create order from user's cart
async function placeOrder(userId, shipping = null, payment = null) {
  const cart = await Cart.findOne({ user: userId }).populate('items.item');

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Build order items with priceAtPurchase to match Order model
  const orderItems = cart.items.map((entry) => ({
    item: entry.item._id,
    quantity: entry.quantity,
    priceAtPurchase: entry.item.price
  }));

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.priceAtPurchase,
    0
  );

  // Validate inventory and decrement quantities atomically-ish
  for (const entry of cart.items) {
    const product = await Item.findById(entry.item._id);
    if (!product) throw new Error(`Item ${entry.item._id} not found`);
    if ((product.quantity || 0) < entry.quantity) {
      throw new Error(`Not enough inventory for ${product.name}`);
    }
    product.quantity = product.quantity - entry.quantity;
    await product.save();
  }

  // Create order
  const orderData = {
    user: userId,
    items: orderItems,
    totalAmount
  };
  if (shipping) orderData.shipping = shipping;
  if (payment) orderData.payment = payment;

  const order = await Order.create(orderData);

  // Clear cart after purchase
  cart.items = [];
  await cart.save();

  // Populate item details before returning
  const populatedOrder = await Order.findById(order._id)
    .populate('items.item')
    .lean();
  
  return populatedOrder;
}

async function getOrdersByUser(userId) {
  return Order.find({ user: userId })
    .populate('items.item')
    .sort({ createdAt: -1 });
}

module.exports = { placeOrder, getOrdersByUser };