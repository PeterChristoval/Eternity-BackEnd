const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category's name is required"],
        max: 20,
        unique: true,
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;