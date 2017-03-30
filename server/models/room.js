const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Receiver = require('./receiver.js');

const roomSchema = new Schema({
    num: String,
    bedCount: Number,
    beds: [{_id: Schema.ObjectId, num: String}],
    institution: {_id: Schema.ObjectId, name: String},
    clients: [{_id: Schema.ObjectId, name: String}],
    assistant: {_id: Schema.ObjectId, name: String},
    receivers: [{_id: Schema.ObjectId, mac: String}]
});

module.exports = mongoose.model('Room', roomSchema);
