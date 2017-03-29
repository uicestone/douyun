const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Receiver = require('./receiver.js');

const roomSchema = new Schema({
    num: String,
    beds: [{_id: Schema.ObjectId, num: String}],
    clients: [{_id: Schema.ObjectId, name: String}],
    assistant: {_id: Schema.ObjectId, name: String},
    receivers: [{_id: Schema.ObjectId, mac: String}]
});

module.exports = mongoose.model('Room', roomSchema);
