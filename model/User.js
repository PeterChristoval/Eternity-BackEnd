const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email must be filled'],
        unique: true,
    },
    username: {
        type: String,
        required: [true, 'Username must be filled'],
        min: 5,
        max: 30,
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password must be filled'],
        min: 5,
        max: 20
    },
    profile: {
        type: String,
    },
    level: {
        type: Number,
        required: true,
        default: 1,
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;