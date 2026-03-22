const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { pool } = require('../config/database');
const { normalizeBoolean } = require('../utils/normalizeBoolean');

const allowedRoles = new Set(['admin', 'manager', 'cashier']);

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

function normalizeRole(role) {
  return allowedRoles.has(role) ? role : 'cashier';
}

async function getProfile(req, res) {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(serializeUser(users[0]));
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Unable to load the user profile' });
  }
}

async function listUsers(req, res) {
  try {
    const [users] = await pool.query(
      `SELECT id, full_name, email, role, is_active, created_at, updated_at
       FROM users
       ORDER BY full_name`
    );

    return res.json(users.map(serializeUser));
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ message: 'Unable to load users' });
  }
}

async function getUserById(req, res) {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(serializeUser(users[0]));
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Unable to load the user' });
  }
}

async function createUser(req, res) {
  try {
    const fullName = String(req.body.full_name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const pin = String(req.body.pin || '').trim();
    const role = normalizeRole(req.body.role);

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
    return res.status(201).json(serializeUser(users[0]));
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ message: 'Unable to create the user' });
  }
}

async function updateUser(req, res) {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = users[0];
    const fullName = String(req.body.full_name || currentUser.full_name).trim();
    const email = String(req.body.email || currentUser.email).trim().toLowerCase();
    const role = req.body.role ? normalizeRole(req.body.role) : currentUser.role;
    const isActive = normalizeBoolean(req.body.is_active, currentUser.is_active);

    if (req.user.id === req.params.id) {
      if (!isActive) {
        return res.status(400).json({ message: 'You cannot deactivate your own account' });
      }

      if (role !== currentUser.role) {
        return res.status(400).json({ message: 'You cannot change your own role' });
      }
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1',
      [email, req.params.id]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'A user with that email already exists' });
    }

    let pinHash = currentUser.pin_hash;
    if (req.body.pin) {
      const nextPin = String(req.body.pin).trim();
      if (!/^\d{4}$/.test(nextPin)) {
        return res.status(400).json({ message: 'PIN must be a 4-digit number' });
      }
      pinHash = await bcrypt.hash(nextPin, 10);
    }

    if (currentUser.role === 'admin' && (!isActive || role !== 'admin')) {
      const [admins] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM users
         WHERE role = 'admin' AND is_active = TRUE AND id != ?`,
        [req.params.id]
      );

      if (admins[0].count <= 0) {
        return res.status(400).json({
          message: 'You cannot remove admin access from the last active admin'
        });
      }
    }

    await pool.query(
      `UPDATE users
       SET full_name = ?, email = ?, pin_hash = ?, role = ?, is_active = ?
       WHERE id = ?`,
      [fullName, email, pinHash, role, isActive, req.params.id]
    );

    const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    return res.json(serializeUser(updatedUsers[0]));
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Unable to update the user' });
  }
}

async function deleteUser(req, res) {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    if (users[0].role === 'admin') {
      const [admins] = await pool.query(
        `SELECT COUNT(*) AS count
         FROM users
         WHERE role = 'admin' AND is_active = TRUE`
      );

      if (admins[0].count <= 1) {
        return res.status(400).json({ message: 'You cannot delete the last active admin' });
      }
    }

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Unable to delete the user' });
  }
}

module.exports = {
  getProfile,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
