const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const institutionSchema = new Schema({
    name: String,
    address: String,
    phone: String,
    photos: [new Schema({url: String})],
    rooms: [{_id: Schema.ObjectId, num: String}]
});

institutionSchema.index({name:1}, {unique:true});

module.exports = mongoose.model('Institution', institutionSchema);
