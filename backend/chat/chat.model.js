const mongoose = require('mongoose');


const chatSchema = new mongoose.Schema(
    {
        senderId : {
            type : String,
            required : true
        },
        text : {
            type : String,
            required : true
        },
        seen : {
            type : Boolean,
            default : false
        },
        timestamp: {
            type: Date,
            default : Date.now
        }
    },
    {
        timestamps: true
    }
);

const Chat = mongoose.model('Chat', chatSchema, 'chats');

module.exports = Chat;