const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { signToken, authenticate } = require('../middleware/auth');

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  try {
    const [rows] = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const token = signToken(user);
    const { password: _, ...safe } = user;
    res.json({ ok: true, token, user: safe });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/register', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'only admins can register new users' });
  }
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password and name required' });
  }
  try {
    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await query('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', [email.toLowerCase(), hashed, name, role || 'viewer']);
    const [rows] = await query('SELECT id, email, name, role, "createdAt" FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, user: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await query('SELECT id, email, name, role, "createdAt" FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    res.json({ ok: true, user: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'new password must be at least 6 characters' });
  }
  try {
    const [rows] = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: 'current password is incorrect' });
    }
    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
