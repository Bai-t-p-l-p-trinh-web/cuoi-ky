const mongoose = require('mongoose');

const viewEntrySchema = new mongoose.Schema({
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

const sellerViewStatSchema = new mongoose.Schema({
    sellerId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
        unique : true
    },
    views : [viewEntrySchema]
}, {
    timestamps : true
});

const View = mongoose.model('View', sellerViewStatSchema, 'views');

module.exports = View;