// backend/services/mailService.js
const nodemailer = require('nodemailer');

const port = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // true nếu dùng SSL port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // ⚠️ bỏ qua lỗi self-signed cert
  },
});

exports.notifyNewOrder = async (order, sheetLink) => {
  const price = Number(order.price || 0).toLocaleString('vi-VN') + 'đ';
  const total = Number(order.total || 0).toLocaleString('vi-VN') + 'đ';

  const html = `
    <h2>🛒 Đơn hàng mới</h2>
    <p><b>Mã đơn:</b> ${order.id}</p>
    <p><b>Sản phẩm:</b> ${order.productName} ${order.variant ? '(' + order.variant + ')' : ''}</p>
    <p><b>SL:</b> ${order.quantity} — <b>Giá:</b> ${price} — <b>Tổng:</b> ${total}</p>
    <p><b>Khách:</b> ${order.fullName} — ${order.phone}<br/>
       <b>Đ/c:</b> ${order.address || '-'}</p>
    <p><b>Ghi chú:</b> ${order.note || '-'}</p>
   
  `;
  //  ${sheetLink ? `<p>Xem bảng đơn: <a href="${sheetLink}">${sheetLink}</a></p>` : ""}

  await transporter.sendMail({
    from: `"TikTok Shop" <${process.env.SMTP_USER}>`,
    to: process.env.SHOP_OWNER_EMAIL,
    subject: `Đơn mới: ${order.productName} x${order.quantity} — ${order.id}`,
    html,
  });
};
