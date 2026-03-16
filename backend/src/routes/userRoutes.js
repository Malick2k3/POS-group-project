const express = require('express');
const {
  getProfile,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { validateUserInput, validateUuidParam } = require('../middleware/validators');

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.get('/', verifyToken, checkRole(['admin']), listUsers);
router.get('/:id', verifyToken, checkRole(['admin']), validateUuidParam, getUserById);
router.post('/', verifyToken, checkRole(['admin']), validateUserInput, createUser);
router.put('/:id', verifyToken, checkRole(['admin']), validateUuidParam, validateUserInput, updateUser);
router.delete('/:id', verifyToken, checkRole(['admin']), validateUuidParam, deleteUser);

module.exports = router;
