// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authRequired } = require('../middleware/authMiddleware');
const User = require('../models/user');
const usersDao = require('../dao/usersDao');

// GET /api/users/me
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ message: 'Error loading profile' });
  }
});

// PUT /api/users/me
router.put('/me', authRequired, async (req, res) => {
  try {
    const { name, phone, address, city, postalCode, country, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.city = city ?? user.city;
    user.postalCode = postalCode ?? user.postalCode;
    user.country = country ?? user.country;
    user.avatar = avatar ?? user.avatar;

    await user.save();

    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.json(safeUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});
 
// ADMIN: update a customer's profile
router.put('/admin/:id', authRequired, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    const id = req.params.id;
    const { name, phone, address, city, postalCode, country, billing } = req.body;
    const user = await usersDao.updateUserById(id, { name, phone, address, city, postalCode, country, billing });
    res.json(user);
  } catch (err) {
    console.error('Error updating user by admin:', err);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// ADMIN: list all users
router.get('/admin/list', authRequired, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    const users = await usersDao.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users for admin:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;