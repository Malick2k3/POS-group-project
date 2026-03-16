const express = require('express');
const { randomUUID } = require('crypto');
const { pool } = require('../config/database');
const { verifyToken, checkRole } = require('../middleware/auth');
const { validateCategoryInput, validateUuidParam } = require('../middleware/validators');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );

    return res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ message: 'Unable to load categories' });
  }
});

router.post('/', verifyToken, checkRole(['admin']), validateCategoryInput, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = req.body.description ?? null;
    const color = String(req.body.color || '#1f6feb').trim();

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [existingCategories] = await pool.query(
      'SELECT id FROM categories WHERE name = ? LIMIT 1',
      [name]
    );

    if (existingCategories.length > 0) {
      return res.status(409).json({ message: 'A category with that name already exists' });
    }

    const id = randomUUID();
    await pool.query(
      'INSERT INTO categories (id, name, description, color) VALUES (?, ?, ?, ?)',
      [id, name, description, color]
    );

    const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return res.status(201).json(categories[0]);
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ message: 'Unable to create the category' });
  }
});

router.put('/:id', verifyToken, checkRole(['admin']), validateUuidParam, validateCategoryInput, async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const current = categories[0];
    const name = String(req.body.name || current.name).trim();
    const description = req.body.description ?? current.description;
    const color = String(req.body.color || current.color || '#1f6feb').trim();

    const [existingCategories] = await pool.query(
      'SELECT id FROM categories WHERE name = ? AND id != ? LIMIT 1',
      [name, req.params.id]
    );

    if (existingCategories.length > 0) {
      return res.status(409).json({ message: 'A category with that name already exists' });
    }

    await pool.query(
      'UPDATE categories SET name = ?, description = ?, color = ? WHERE id = ?',
      [name, description, color, req.params.id]
    );

    const [updatedCategories] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [req.params.id]
    );

    return res.json(updatedCategories[0]);
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({ message: 'Unable to update the category' });
  }
});

router.delete('/:id', verifyToken, checkRole(['admin']), validateUuidParam, async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE category_id = ?',
      [req.params.id]
    );

    if (products[0].count > 0) {
      return res.status(400).json({
        message: 'Cannot delete a category that still has products assigned'
      });
    }

    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Unable to delete the category' });
  }
});

module.exports = router;
