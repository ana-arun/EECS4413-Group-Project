// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.substring('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      isAdmin: payload.isAdmin
    };
    next();
  } catch (err) {
    console.error('authRequired error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = {
  authRequired
};