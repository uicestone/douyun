const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const receiverSchema = new Schema({
    mac: String
});

receiverSchema.index({mac:1}, {unique:true});

module.exports = mongoose.model('Receiver', receiverSchema);
