const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// ✅ Route để FE lấy thông tin user từ cookie JWT
router.get('/me', verifyToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
