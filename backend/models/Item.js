// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    brand: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },

    // NEW: which user created this item (for “customers can list products”)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);