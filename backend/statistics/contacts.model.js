const mongoose = require('mongoose');

const contactEntrySchema = new mongoose.Schema({
    counts : {
        type : Number,
        default : 0
    },
    time : {
        type : String,
        required : true
    }
},
{
    _id : false
});

const sellerContactStatSchema = new mongoose.Schema({
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
        unique : true
    },
    contacts : [contactEntrySchema]
}, {
    timestamps : true
});

const Contact = mongoose.model('Contact', sellerContactStatSchema, 'contacts');

module.exports = Contact;