const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        max: 20,
        unique: true,
    }
});

const Label = mongoose.model('Label', labelSchema);

module.exports = Label;