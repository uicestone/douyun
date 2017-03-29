const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const beanSchema = new Schema({
    mac: String,
    records: [{temp: Number, humi: Number, time: Date}]
});

beanSchema.index({mac:1}, {unique:true});

module.exports = mongoose.model('Bean', beanSchema);
