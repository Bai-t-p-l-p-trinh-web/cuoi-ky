const Thread = require('./thread.model');
const Chat = require('../chat/chat.model');
const sendMessages = async (threadId, senderId, text) => {
    try {
        const thread = await Thread.findById(threadId);

        if(!thread) {
            return {
                status : false
            };
        }
        const dateNow = new Date(Date.now()).toISOString();
        const msg = new Chat({
            senderId,
            text
        });

        await msg.save();
        const msgId = msg._id;

        thread.msgIds.push(msgId);
        await thread.save();

        const otherUserId = thread.user1Id === senderId ? thread.user2Id : thread.user1Id;
        return {
            status : true,
            msgId,
            timestamp : dateNow,
            receiverId : otherUserId
        };
    } catch(error) {
        return {
            status : false
        }
    }
}

const findOtherUserIdByThreadId = async(userId, threadId) => {
    try {
        const thread = await Thread.findById(threadId);
        
        if(!thread) return {
            status : false
        };

        const otherUserId = thread.user1Id === userId ? thread.user2Id : thread.user1Id;
        return {
            status : true,
            receiverId : otherUserId
        };
    } catch (error) {
        return {
            status : false
        };
    }
}
module.exports = {
    sendMessages,
    findOtherUserIdByThreadId
}