const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Thư mục uploads nằm trong project
const descDir = path.join(process.cwd(), '../uploads');
if (!fs.existsSync(descDir)) {
  fs.mkdirSync(descDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, descDir); // Lưu file vào thư mục uploads trong project
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Upload 1 ảnh
router.post('/', upload.single('image'), (req, res) => {
  console.log(req.file);
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Chỉ trả về URL public, không phải đường dẫn tuyệt đối trong container
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
