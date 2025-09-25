// backend/controllers/productController.js
const Product = require('../models/productModel');

const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

// ================= Tạo sản phẩm =================
const createProduct = async (req, res) => {
  try {
    const { name, price, description, material, colors, sizes, category, status, variants, isHot, isNew } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'Vui lòng nhập tên và danh mục sản phẩm.' });
    }

    const priceValue = Number(price);
    if (isNaN(priceValue)) {
      return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ.' });
    }

    const imageFiles = (req.files || []).filter(f => f.fieldname === 'images');
    const images = imageFiles.map(file => `/uploads/${file.filename}`);
    const firstImage = images[0] || '';

    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = JSON.parse(variants).map((v, idx) => {
          const f = (req.files || []).find(file => file.fieldname === `variantImages_${idx}`);
          if (f) v.image = `/uploads/${f.filename}`;
          return {
            color: v.color || '',
            size: v.size || '',
            price: v.price ? Number(v.price) : 0,
            stock: v.stock ? Number(v.stock) : 0,
            material: v.material || '',
            description: v.description || '',
            status: v.status || 'Còn hàng',
            image: v.image || '',
          };
        });
      } catch (err) {
        console.warn('Không thể parse variants:', err);
      }
    }

    const newProduct = await Product.create({
      name,
      price: priceValue,
      image: firstImage,
      images,
      description,
      material,
      colors,
      sizes,
      category,
      status: status || 'Còn hàng',
      variants: parsedVariants,
      isHot: toBool(isHot),
      isNew: toBool(isNew),
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Lỗi khi tạo sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm' });
  }
};


// ================= Cập nhật sản phẩm =================
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, material, colors, sizes, category, status, variants, isHot, isNew } = req.body;
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const imageFiles = (req.files || []).filter(f => f.fieldname === 'images');
    if (imageFiles.length > 0) {
      product.images = imageFiles.map(f => `/uploads/${f.filename}`);
      product.image = product.images[0];
    }

    if (variants) {
      try {
        let parsedVariants = JSON.parse(variants);
        parsedVariants = parsedVariants.map((v, idx) => {
          const f = (req.files || []).find(file => file.fieldname === `variantImages_${idx}`);
          if (f) v.image = `/uploads/${f.filename}`;
          else if (product.variants && product.variants[idx]) {
            v.image = product.variants[idx].image; // giữ ảnh cũ
          }
          return {
            color: v.color || '',
            size: v.size || '',
            price: v.price ? Number(v.price) : 0,
            stock: v.stock ? Number(v.stock) : 0,
            material: v.material || '',
            description: v.description || '',
            status: v.status || 'Còn hàng',
            image: v.image || '',
          };
        });
        product.variants = parsedVariants;
      } catch (err) {
        console.warn('Không thể parse variants:', err);
      }
    }

    product.name = name ?? product.name;
    product.price = price != null ? Number(price) : product.price;
    product.description = description ?? product.description;
    product.material = material ?? product.material;
    product.colors = colors ?? product.colors;
    product.sizes = sizes ?? product.sizes;
    product.category = category ?? product.category;
    product.status = status ?? product.status;

    if (isHot !== undefined) product.isHot = toBool(isHot);
    if (isNew !== undefined) product.isNew = toBool(isNew);

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Lỗi khi cập nhật sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm' });
  }
};

// ================= Get All =================
const getAllProducts = async (req, res) => {
  try {
    const { search, isHot, isNew } = req.query;
    const q = (search || '').trim();

    const filter = {};
    if (isHot === 'true') filter.isHot = true;
    if (isNew === 'true') filter.isNew = true;

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { material: { $regex: q, $options: 'i' } },
        { colors: { $regex: q, $options: 'i' } },
        { sizes: { $regex: q, $options: 'i' } },
        { 'variants.color': { $regex: q, $options: 'i' } },
        { 'variants.size': { $regex: q, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Lỗi khi lấy sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm' });
  }
};

// ================= Get By ID =================
const getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(p);
  } catch (err) {
    console.error('Lỗi khi lấy sản phẩm theo ID:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm theo ID' });
  }
};

// ================= Delete =================
const deleteProduct = async (req, res) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Đã xoá sản phẩm' });
  } catch (err) {
    console.error('Lỗi khi xoá sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi xoá sản phẩm' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
