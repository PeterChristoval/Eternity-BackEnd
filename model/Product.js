const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: 40
    },
    code: {
        type: String,
        required: true,
        max: 20,
        unique: true,
    },
    description: {
        type: String,
        max: 300,
        required: [true, "Image must be filled"],
    },
    // img: [{
    //     type: String,
    //     required: [true, "Image must be filled"],
    // }],
    price: {
        type: Number,
        required: [true, 'Price must be filled'],
    },
    stock: {
        type: Number,
        required: [true, 'Stock must be filled'],
    },
    category_id: {
        type: ObjectId,
        ref: "Category"
    },
    label_id: {
        type: ObjectId,
        ref: "Label"
    },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;