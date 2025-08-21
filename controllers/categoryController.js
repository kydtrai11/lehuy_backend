const Category = require('../models/categoryModel');

// GET tất cả danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parent', 'name _id')
      .sort({ createdAt: -1 });

    const processed = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      parent: cat.parent ? cat.parent._id : null,
      __v: cat.__v,
    }));

    res.json(processed);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục' });
  }
};

// Tạo danh mục
const createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });

    const newCategory = new Category({ name, parent: parent || null });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Lỗi tạo danh mục:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo danh mục' });
  }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Lỗi khi cập nhật danh mục' });
  }
};

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xoá danh mục
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const categoryToDelete = await Category.findById(categoryId);
    if (!categoryToDelete) return res.status(404).json({ message: 'Không tìm thấy danh mục' });

    const parentId = categoryToDelete.parent;

    await Category.updateMany({ parent: categoryId }, { parent: parentId });
    await Category.findByIdAndDelete(categoryId);

    res.json({ message: 'Đã xoá danh mục thành công', deletedId: categoryId });
  } catch (err) {
    console.error('Lỗi khi xoá danh mục:', err);
    res.status(400).json({ message: 'Không thể xoá danh mục' });
  }
};

// ✅ Xuất module theo đúng CommonJS
module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
