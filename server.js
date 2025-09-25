const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

/* ===== CORS ===== */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  })
);


/* ===== Middleware ===== */
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

/* ===== Static Files ===== */
const uploadsPath = path.resolve(__dirname, 'uploads');
const exportsPath = path.resolve(__dirname, 'exports');

console.log('✅ Serving uploads from:', uploadsPath);
console.log('✅ Serving exports from:', exportsPath);

app.use('/uploads', express.static(uploadsPath));
app.use('/exports', express.static(exportsPath));

/* ===== Upload route cho mô tả sản phẩm ===== */
app.use('/api/upload/description', require('./routes/uploadRoutes'));

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
