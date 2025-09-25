const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const upload = require('../middleware/upload');

// Xoá sản phẩm
router.delete('/:id', deleteProduct);

// Lấy chi tiết sản phẩm theo ID
router.get('/:id', getProductById);

// Lấy toàn bộ sản phẩm
router.get('/', getAllProducts);

// Tạo sản phẩm mới
router.post(
  '/',
  // ✅ nhận tất cả file: images + variantImages_0, variantImages_1...
  upload.any(),
  createProduct
);

// Cập nhật sản phẩm
router.put(
  '/:id',
  upload.any(),
  updateProduct
);

module.exports = router;
