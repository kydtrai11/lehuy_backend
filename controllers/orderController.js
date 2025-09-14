const { notifyNewOrder } = require('../services/mailService');

exports.createOrder = async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    const b = req.body || {};
    const customer = b.customer || {};
    const productName = b.productName || b.name;

    // Cho phép lấy thông tin từ b.customer hoặc trực tiếp trong body
    const fullName = b.fullName || customer.fullName;
    const phone = b.phone || customer.phone;
    const address = b.address || customer.address;
    const note = b.note || customer.note;

    if (!fullName || !phone || !productName) {
      return res.status(400).json({ ok: false, message: 'Thiếu thông tin bắt buộc' });
    }

    const qty = Number(b.quantity || 1) || 1;
    const price = Number(b.price || 0) || 0;

    const variantStr = (typeof b.variant === 'object' && b.variant)
      ? [b.variant.color ? `Màu: ${b.variant.color}` : null,
      b.variant.size ? `Size: ${b.variant.size}` : null]
        .filter(Boolean).join('; ')
      : (b.variant || '');

    const order = {
      id: 'OD-' + Date.now(),
      productId: b.productId,
      productName,
      variant: variantStr,
      quantity: qty,
      price,
      total: price * qty,
      fullName,
      phone,
      address,
      note,
      // có thể thêm createdAt: new Date() nếu bạn muốn
    };

    // ❌ Không ghi Google Sheet nữa
    // ✅ (Tuỳ chọn) gửi email thông báo; nếu fail thì vẫn trả ok
    try {
      if (notifyNewOrder) {
        await notifyNewOrder(order /* , sheetLink */);
      }
    } catch (mailErr) {
      console.warn('[Mail] send failed but order continues:', mailErr?.message || mailErr);
    }

    console.log('Order created successfully:', order.id);
    return res.json({ ok: true, orderId: order.id });
  } catch (e) {
    console.error('createOrder error:', e);
    const errorMessage = e.message || 'Không thể tạo đơn';
    return res.status(500).json({ ok: false, message: errorMessage });
  }
};
