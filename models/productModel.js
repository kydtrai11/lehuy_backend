const mongoose = require('mongoose');

// Variant
const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size:  { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String, default: '' },
  material: { type: String, default: '' },
  description: { type: String, default: '' },
  status: { type: String, default: 'Còn hàng' },
}, { _id: false });

// Product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  image:{ type: String, required: true }, // ảnh đại diện
  price:{ type: Number, default: 0 },
  description:{ type: String, default: '' },
  category:{ type: String, required: true },
  material:{ type: String, default: '' },
  status:{ type: String, default: 'Còn hàng' },
  colors:{ type: String, default: '' },
  sizes: { type: String, default: '' },
  variants: [variantSchema],

  // ✅ flags hiển thị
  isHot: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
}, { timestamps: true });

productSchema.index({ isHot: 1 });
productSchema.index({ isNew: 1, createdAt: -1 });

// Thêm dưới cùng trước khi export
productSchema.index({
  name: 'text',
  description: 'text',
  material: 'text',
  colors: 'text',
  sizes: 'text',
  'variants.color': 'text',
  'variants.size': 'text'
});


module.exports = mongoose.model('Product', productSchema);
