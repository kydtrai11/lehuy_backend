const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.get('/:id', getCategoryById); // ✅ API đang gọi bị lỗi nếu thiếu dòng này

module.exports = router;
