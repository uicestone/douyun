const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const beanSchema = new Schema({
	client: {_id: Schema.ObjectId, name: String},
    mac: String,
    temp: Number,
    humi: Number,
    distance: Number,
    lastUpdatedAt: Date,
    records: {type: Array, select: false, schema: [{temp: Number, humi: Number, distance: Number, updatedAt: Date}]}
});

beanSchema.index({mac:1}, {unique:true});

module.exports = mongoose.model('Bean', beanSchema);
