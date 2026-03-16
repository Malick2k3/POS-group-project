const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { pool } = require('../config/database');

const allowedRoles = new Set(['admin', 'manager', 'cashier']);

function sanitizeRole(role) {
  return allowedRoles.has(role) ? role : 'cashier';
}

function buildToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'development-pos-secret-change-me',
    { expiresIn: '12h' }
  );
}

function serializeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    is_active: Boolean(user.is_active),
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

async function login(req, res) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const pin = String(req.body.pin || '').trim();

    if (!email || !pin) {
      return res.status(400).json({ message: 'Email and PIN are required' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or PIN' });
    }

    const user = users[0];
    const validPin = await bcrypt.compare(pin, user.pin_hash);

    if (!validPin) {
      return res.status(401).json({ message: 'Invalid email or PIN' });
    }

    return res.json({
      token: buildToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to log in right now' });
  }
}

async function register(req, res) {
  try {
    const fullName = String(req.body.full_name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const pin = String(req.body.pin || '').trim();
    const role = sanitizeRole(req.body.role);

    if (!fullName || !email || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        message: 'Full name, email, and a 4-digit PIN are required'
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    const id = randomUUID();
    const pinHash = await bcrypt.hash(pin, 10);

    await pool.query(
      `INSERT INTO users (id, full_name, email, pin_hash, role, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [id, fullName, email, pinHash, role]
    );

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

    return res.status(201).json({
      token: buildToken(users[0]),
      user: serializeUser(users[0])
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Unable to register right now' });
  }
}

async function getCurrentUser(req, res) {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(serializeUser(users[0]));
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Unable to load the current user' });
  }
}

module.exports = {
  login,
  register,
  getCurrentUser
};
