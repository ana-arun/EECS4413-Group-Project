const Cart = require('../models/Cart');
const Item = require('../models/Item');

// GET /api/cart
async function getCart(req, res) {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user: userId }).populate('items.item');

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
      cart = await cart.populate('items.item');
    }

    // If any cart entries reference items that were deleted (populate -> null), remove them and persist
    const originalLen = cart.items.length;
    cart.items = cart.items.filter((ci) => ci.item != null);
    if (cart.items.length !== originalLen) {
      await cart.save();
      cart = await cart.populate('items.item');
    }

    res.json(cart);
  } catch (err) {
    console.error('Error in getCart:', err);
    res.status(500).json({ message: 'Error fetching cart' });
  }
}

// POST /api/cart/add  { itemId, quantity }
async function addToCart(req, res) {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;
    let { quantity } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: 'itemId is required' });
    }

    // delta can be positive or negative
    quantity = Number(quantity);
    if (Number.isNaN(quantity) || quantity === 0) {
      return res.status(400).json({ message: 'quantity must be non-zero' });
    }

    // Ensure item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const index = cart.items.findIndex(
      (ci) => ci.item.toString() === itemId.toString()
    );

    if (index === -1) {
      // If item not in cart yet, only add if quantity > 0
      if (quantity > 0) {
        cart.items.push({ item: itemId, quantity });
      } else {
        return res
          .status(400)
          .json({ message: 'Cannot add a new item with negative quantity' });
      }
    } else {
      // Adjust existing quantity
      cart.items[index].quantity += quantity;
      if (cart.items[index].quantity <= 0) {
        // Remove item from cart
        cart.items.splice(index, 1);
      }
    }

    await cart.save();
    cart = await cart.populate('items.item');
    res.json(cart);
  } catch (err) {
    console.error('Error in addToCart:', err);
    res.status(500).json({ message: 'Error updating cart' });
  }
}

module.exports = {
  getCart,
  addToCart,
  setItemQuantity
};

// POST /api/cart/set  { itemId, quantity }
async function setItemQuantity(req, res) {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;
    let { quantity } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: 'itemId is required' });
    }

    quantity = Number(quantity);
    if (Number.isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'quantity must be a non-negative number' });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const index = cart.items.findIndex((ci) => ci.item.toString() === itemId.toString());
    if (index === -1) {
      if (quantity > 0) cart.items.push({ item: itemId, quantity });
    } else {
      if (quantity === 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = quantity;
      }
    }

    await cart.save();
    cart = await cart.populate('items.item');
    res.json(cart);
  } catch (err) {
    console.error('Error in setItemQuantity:', err);
    res.status(500).json({ message: 'Error updating cart quantity' });
  }
}