const jwt = require('jsonwebtoken');

const SECRET = () => process.env.JWT_SECRET || 'teleios-dev-secret';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'viewer' },
    SECRET(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET());
  } catch {
    return null;
  }
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const payload = verifyToken(header.slice(7));
  if (!payload) {
    return res.status(401).json({ error: 'invalid or expired token' });
  }
  req.user = payload;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

module.exports = { signToken, verifyToken, authenticate, requireRole };
