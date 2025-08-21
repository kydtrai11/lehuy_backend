const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct, // ✅ Bổ sung đúng tại đây
} = require('../controllers/productController');

const upload = require('../middleware/upload');

// ✅ Xoá sản phẩm
router.delete('/:id', deleteProduct);

// ✅ Lấy chi tiết sản phẩm theo ID
router.get('/:id', getProductById);

// ✅ Lấy toàn bộ sản phẩm
router.get('/', getAllProducts);

// ✅ Tạo sản phẩm mới
router.post(
  '/',
  upload.fields([
    { name: 'main', maxCount: 1 },
    { name: 'variantImages' },
  ]),
  createProduct
);

// ✅ Cập nhật sản phẩm (ghi đè)
router.put(
  '/:id',
  upload.fields([
    { name: 'main', maxCount: 1 },
    { name: 'variantImages' },
  ]),
  updateProduct
);

module.exports = router;
