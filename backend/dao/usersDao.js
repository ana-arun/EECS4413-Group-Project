// dao/usersDao.js

const User = require('../models/user');

async function findByEmail(email) {
  return await User.findOne({ email });
}

async function createUser({ name, email, passwordHash, phone = '', address = '', city = '', postalCode = '', country = '', avatar = '' }) {
  const isAdmin = false;

  const user = new User({
    name,
    email,
    passwordHash,
    isAdmin,
    phone,
    address,
    city,
    postalCode,
    country,
    avatar
  });

  // if billing metadata passed, store metadata-only
  if (arguments[0] && arguments[0].billing) {
    user.billing = {
      cardBrand: arguments[0].billing.cardBrand || '',
      last4: arguments[0].billing.last4 || '',
      expMonth: arguments[0].billing.expMonth || '',
      expYear: arguments[0].billing.expYear || ''
    };
  }
  return await user.save();
}

async function getUserById(id) {
  return await User.findById(id).select('-passwordHash');
}

async function updateUserById(id, data) {
  const user = await User.findById(id);
  if (!user) return null;
  const fields = ['name', 'phone', 'address', 'city', 'postalCode', 'country', 'avatar'];
  for (const f of fields) {
    if (data[f] !== undefined) user[f] = data[f];
  }
  // Support billing updates if provided (only store metadata, not full card numbers)
  if (data.billing) {
    user.billing = user.billing || {};
    const bf = ['cardBrand', 'last4', 'expMonth', 'expYear'];
    for (const b of bf) {
      if (data.billing[b] !== undefined) user.billing[b] = data.billing[b];
    }
  }
  await user.save();
  return await User.findById(id).select('-passwordHash');
}

async function getAllUsers() {
  return await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
}

async function setAdminStatus(id, isAdmin) {
  const user = await User.findById(id);
  if (!user) return null;
  user.isAdmin = !!isAdmin;
  await user.save();
  return user;
}

module.exports = {
  findByEmail,
  createUser,
  getUserById,
  updateUserById,
  getAllUsers,
  setAdminStatus
};