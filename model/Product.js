const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: [true, "Prodcut's name must be filled"],
        max: 40
    },
    product_code: {
        type: String,
        required: [true, "Product's code must be filled"],
        max: 20,
        unique: true,
    },
    price: {
        type: Number,
        required: [true, 'Price must be filled'],
    },
    category_id: {
        type: ObjectId,
        ref: "Category"
    },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;