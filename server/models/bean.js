const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const beanSchema = new Schema({
	client: {_id: Schema.ObjectId, name: String},
    mac: String,
    rssi: Number,
    temp: Number,
    humi: Number,
    distance: Number,
    battery: Number,
    lastUpdatedAt: Date
});

beanSchema.index({mac:1}, {unique:true});

module.exports = mongoose.model('Bean', beanSchema);
