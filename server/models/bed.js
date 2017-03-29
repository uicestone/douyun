const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bedSchema = new Schema({
    num: String
});

module.exports = mongoose.model('Bed', bedSchema);
