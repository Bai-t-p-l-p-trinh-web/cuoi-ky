const mongoose = require('mongoose');


const threadSchema = new mongoose.Schema(
    {
        user1Id : {
            type : String,
            required : true
        },
        user2Id : {
            type : String,
            required : true
        },
        msgIds : Array
    },
    {
        timestamps: true
    }
);

const Thread = mongoose.model('Thread', threadSchema, 'threads');

module.exports = Thread;