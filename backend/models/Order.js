// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true }
});

const shippingSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true }
});

const paymentSummarySchema = new mongoose.Schema({
  cardBrand: { type: String, required: true },
  last4: { type: String, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },

    // NEW:
    shipping: { type: shippingSchema, required: true },
    payment: { type: paymentSummarySchema, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);