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

const router = express.Router();

router.get('/profile', verifyToken, getProfile);
router.get('/', verifyToken, checkRole(['admin']), listUsers);
router.get('/:id', verifyToken, checkRole(['admin']), getUserById);
router.post('/', verifyToken, checkRole(['admin']), createUser);
router.put('/:id', verifyToken, checkRole(['admin']), updateUser);
router.delete('/:id', verifyToken, checkRole(['admin']), deleteUser);

module.exports = router;
