// dao/cartDao.js

const Cart = require('../models/Cart');
const Item = require('../models/Item');

async function getCartByUserId(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.item');
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
    await cart.save();
    cart = await cart.populate('items.item');
  }
  return cart;
}

async function addItem(userId, itemId, quantity) {
  const item = await Item.findById(itemId);
  if (!item) {
    throw new Error('Item not found');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existing = cart.items.find(
    (entry) => entry.item.toString() === itemId.toString()
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ item: itemId, quantity });
  }

  await cart.save();
  return await cart.populate('items.item');
}

async function updateItemQuantity(userId, itemId, quantity) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error('Cart not found');
  }

  const entry = cart.items.find(
    (e) => e.item.toString() === itemId.toString()
  );

  if (!entry) {
    throw new Error('Item not in cart');
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (e) => e.item.toString() !== itemId.toString()
    );
  } else {
    entry.quantity = quantity;
  }

  await cart.save();
  return await cart.populate('items.item');
}

async function removeItem(userId, itemId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (e) => e.item.toString() !== itemId.toString()
  );

  await cart.save();
  return await cart.populate('items.item');
}

async function clearCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return null;
  }

  cart.items = [];
  await cart.save();
  return cart;
}

module.exports = {
  getCartByUserId,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
};