const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Room = require('./room.js');
const Bed = require('./bed.js');
const Bean = require('./bean.js');

const clientSchema = new Schema({
    name: String,
    institution: {_id: Schema.ObjectId, name: String},
    room: {_id: Schema.ObjectId, num: String, bedNum: String},
    bed: {_id: Schema.ObjectId, num: String},
    bean: {_id: Schema.ObjectId, mac: String},
    assistant: {_id: Schema.ObjectId, name: String},
    families: [{_id: Schema.ObjectId, name: String}],
    gender: String,
    age: Number,
    history: String,
    status: new Schema({since: Date, name: String}),
});

module.exports = mongoose.model('Client', clientSchema);
