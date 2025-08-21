// backend/controllers/orderController.js
const { appendOrder } = require('../services/sheetsService');
const { notifyNewOrder } = require('../services/mailService');

exports.createOrder = async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    const b = req.body || {};
    const customer = b.customer || {};
    const productName = b.productName || b.name;
    const fullName   = b.fullName   || customer.fullName;
    const phone      = b.phone      || customer.phone;
    const address    = b.address    || customer.address;
    const note       = b.note       || customer.note;

    if (!fullName || !phone || !productName) {
      return res.status(400).json({ ok:false, message:'Thiếu thông tin bắt buộc' });
    }

    const qty = Number(b.quantity || 1) || 1;
    const p   = Number(b.price || 0) || 0;

    const variantStr = typeof b.variant === 'object' && b.variant
      ? [b.variant.color ? `Màu: ${b.variant.color}` : null,
         b.variant.size  ? `Size: ${b.variant.size}`  : null].filter(Boolean).join('; ')
      : (b.variant || '');

    const order = {
      id: 'OD-' + Date.now(),
      productId: b.productId,
      productName,
      variant: variantStr,
      quantity: qty,
      price: p,
      total: p * qty,
      fullName, phone, address, note,
    };

    const sheetLink = await appendOrder(order);
    await notifyNewOrder(order, sheetLink);

    console.log('Order created successfully:', order.id);
    res.json({ ok: true, orderId: order.id });
  } catch (e) {
    console.error('createOrder error:', e);
    const errorMessage = e.message || 'Không thể tạo đơn';
    console.error('Detailed error:', e.stack);
    res.status(500).json({ 
      ok: false, 
      message: errorMessage,
      detail: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
};
