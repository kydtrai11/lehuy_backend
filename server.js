const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

/* ===== CORS đơn giản ===== */
app.use(cors({
  origin: '*',// ✅ FE chạy ở đây
  credentials: true,               // ✅ để cookie gửi kèm
}));

/* ===== Middleware ===== */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===== Static Files ===== */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/exports', express.static(path.join(__dirname, 'exports')));

/* ===== Routes ===== */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

/* ===== Health Check ===== */
app.get('/healthz', (_req, res) => res.json({ ok: true }));

/* ===== Start Server ===== */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Backend is running at http://localhost:${PORT}`);
});

