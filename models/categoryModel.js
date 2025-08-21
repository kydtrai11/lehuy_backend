const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
});
timestamps: true // 👈 thêm dòng này
module.exports = mongoose.model('Category', categorySchema);

