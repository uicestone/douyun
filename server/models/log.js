const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    createdAt: Date,
    title: String,
    description: String,
    duration: Number,
    assistant: {_id: Schema.ObjectId, name: String},
    client: {_id: Schema.ObjectId, name: String}
});

module.exports = mongoose.model('Log', logSchema);
