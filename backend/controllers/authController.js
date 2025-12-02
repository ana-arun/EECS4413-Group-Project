// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersDao = require('../dao/usersDao');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'campustech@my.yorku.ca';

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, phone, address, city, postalCode, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await usersDao.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await usersDao.createUser({ name, email, passwordHash, phone, address, city, postalCode, country });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await usersDao.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If this login email matches the configured admin email, ensure the DB flag is set
    if (user.email && String(user.email).toLowerCase() === ADMIN_EMAIL) {
      if (!user.isAdmin) {
        try {
          await usersDao.setAdminStatus(user._id, true);
          user.isAdmin = true;
        } catch (e) {
          console.error('Failed to set admin flag for user:', e);
        }
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

// GET /api/auth/me  (protected)
async function me(req, res) {
  try {
    const user = await usersDao.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
}

module.exports = {
  register,
  login,
  me
};