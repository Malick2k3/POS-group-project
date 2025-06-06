const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getProfile);

// Get all users (admin only)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY username'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID (admin only)
router.get('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create user (admin only)
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      id: userId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user (admin only)
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new username or email already exists
    if (username || email) {
      const [existingUsers] = await pool.query(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || users[0].username, email || users[0].email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
    }

    // Update user
    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length > 0) {
      params.push(userId);
      await pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (users[0].role === 'admin') {
      const [admins] = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['admin']
      );

      if (admins[0].count <= 1) {
        return res.status(400).json({
          message: 'Cannot delete the last admin user'
        });
      }
    }

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 