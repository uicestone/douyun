const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    name: String,
    institution: {_id: Schema.ObjectId, name: String},
    room: {_id: Schema.ObjectId, num: String, bedNum: String},
    bed: {_id: Schema.ObjectId, num: String},
    bean: {_id: Schema.ObjectId, mac: String},
    assistant: {_id: Schema.ObjectId, name: String, avatar: String, openid: String},
    families: [{_id: Schema.ObjectId, name: String, avatar: String, openid: String}],
    gender: String,
    age: Number,
    history: String,
    status: new Schema({since: Date, name: String})
});

module.exports = mongoose.model('Client', clientSchema);
