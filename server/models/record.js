const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recordSchema = new Schema({
	bean: Schema.ObjectId,
    rssi: Number,
    temp: Number,
    humi: Number,
    distance: Number,
    updatedAt: Date
});

recordSchema.index({bean:1, lastUpdatedAt:-1});

module.exports = mongoose.model('Record', recordSchema);
