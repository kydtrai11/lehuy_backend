const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Đường dẫn tương đối
const descDir = '../uploads';

// Kiểm tra và tạo thư mục
try {
  if (!fs.existsSync(descDir)) {
    fs.mkdirSync(descDir, { recursive: true });
    console.log(`Thư mục ${descDir} đã được tạo.`);
  } else {
    console.log(`Thư mục ${descDir} đã tồn tại.`);
  }
} catch (err) {
  console.error(`Lỗi khi tạo thư mục ${descDir}:`, err);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Đang lưu vào:', descDir);
    cb(null, descDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload 1 ảnh
router.post('/', upload.single('image'), (req, res) => {
  console.log('File:', req.file);
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;