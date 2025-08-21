const User = require('../models/User');
const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';

// Tùy theo triển khai: dev (cùng localhost) dùng SameSite=Lax, prod khác domain dùng None+Secure
const cookieOpts = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd, // bắt buộc true nếu SameSite=None & HTTPS
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
};

// Đăng ký
exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });

    const user = await User.create({ email, password });

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Đăng nhập: phát hành JWT + set cookie httpOnly: "session"
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // kéo dài 7 ngày để khớp cookie
    );

    // ✅ Set-Cookie: "session" cho FE middleware đọc
    res.cookie('session', token, cookieOpts);

    return res.json({
      ok: true,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Đăng xuất: xóa cookie "session"
exports.logoutUser = async (_req, res) => {
  res.clearCookie('session', { ...cookieOpts, maxAge: 0 });
  res.json({ ok: true });
};
