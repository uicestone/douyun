const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const beanSchema = new Schema({
    mac: String,
    temp: Number,
    humi: Number,
    distance: Number,
    lastUpdatedAt: Date,
    records: [{temp: Number, humi: Number, distance: Number, updatedAt: Date}]
});

beanSchema.index({mac:1}, {unique:true});

module.exports = mongoose.model('Bean', beanSchema);
