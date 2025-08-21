const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // lưu trong thư mục uploads/
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const multerInstance = multer({ storage });

module.exports = multerInstance; // ✅ xuất đúng instance multer để dùng .fields()
