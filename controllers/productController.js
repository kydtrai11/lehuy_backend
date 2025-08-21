const Product = require('../models/productModel');

const toBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

// ✅ Lấy tất cả sản phẩm (có lọc theo query)

// ✅ Lấy tất cả sản phẩm (có lọc theo query + tìm kiếm)
const getAllProducts = async (req, res) => {
  try {
    const { search, isHot, isNew } = req.query;
    const q = (search || '').trim();

    const filter = {};
    if (isHot === 'true') filter.isHot = true;
    if (isNew === 'true') filter.isNew = true;

    // thêm điều kiện tìm kiếm tự do
    if (q) {
      filter.$or = [
        { name:        { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { material:    { $regex: q, $options: 'i' } },
        { colors:      { $regex: q, $options: 'i' } },
        { sizes:       { $regex: q, $options: 'i' } },
        { 'variants.color': { $regex: q, $options: 'i' } },
        { 'variants.size':  { $regex: q, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm' });
  }
};

// ✅ Tạo sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const {
      name, price, description, material,
      colors, sizes, category, status, variants,
      isHot, isNew, // ✅ nhận flags
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Vui lòng nhập tên và danh mục sản phẩm.' });
    }

    const mainImage = req.files?.main?.[0];
    const variantImages = req.files?.variantImages || [];

    let parsedVariants = [];
    if (variants) {
      try {
        const raw = JSON.parse(variants);
        parsedVariants = raw.map((variant, index) => ({
          ...variant,
          image: variantImages[index]?.filename
            ? `/uploads/${variantImages[index].filename}`
            : (typeof variant.image === 'string' ? variant.image : ''),
        }));
      } catch (err) {
        console.warn('Không thể parse variants:', err);
      }
    }

    const newProduct = await Product.create({
      name,
      price: price ? Number(price) : 0,
      image: mainImage ? `/uploads/${mainImage.filename}` : '',
      description,
      material,
      colors,
      sizes,
      category,
      status,
      variants: parsedVariants,

      // ✅ set flags
      isHot: toBool(isHot),
      isNew: toBool(isNew),
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Lỗi khi tạo sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm' });
  }
};

// ✅ Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const {
      name, price, description, material,
      colors, sizes, category, status, variants,
      isHot, isNew, // ✅ nhận flags
    } = req.body;

    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });

    const mainImage = req.files?.main?.[0];
    const variantImages = req.files?.variantImages || [];

    let parsedVariants = product.variants || [];
    if (variants) {
      try {
        const raw = JSON.parse(variants);
        parsedVariants = raw.map((variant, index) => ({
          ...variant,
          image: variantImages[index]?.filename
            ? `/uploads/${variantImages[index].filename}`
            : (typeof variant.image === 'string' ? variant.image : ''),
        }));
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
    product.variants = parsedVariants;

    // ✅ cập nhật flags (nếu FE gửi lên)
    if (isHot !== undefined) product.isHot = toBool(isHot);
    if (isNew !== undefined) product.isNew = toBool(isNew);

    if (mainImage) product.image = `/uploads/${mainImage.filename}`;

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm' });
  }
};

// ✅ Xoá sản phẩm
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xoá' });
    res.json({ message: 'Xoá sản phẩm thành công' });
  } catch (err) {
    console.error('❌ Lỗi khi xoá sản phẩm:', err);
    res.status(500).json({ message: 'Lỗi server khi xoá sản phẩm' });
  }
};

// ✅ Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo ID:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
