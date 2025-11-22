// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },

    // NEW profile fields
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
    ,
    avatar: { type: String, default: '' }
    ,
    billing: {
      cardBrand: { type: String, default: '' },
      last4: { type: String, default: '' },
      expMonth: { type: String, default: '' },
      expYear: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);