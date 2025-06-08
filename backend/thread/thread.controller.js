const User = require("../user/user.model");
const Thread = require('./thread.model');
const Chat = require('../chat/chat.model');

// [GET] /api/v1/threads     
// {userId} => {full Threads}
const getThreadById = async(req, res) => {
    try {
        const userId = req.userId;
        
        const user = await User.findOne({
            _id : userId
        });

        if(!user) return res.status(404).json({ message : "Không tìm thấy người dùng!" });

        const threads = await Thread.find({
            $or : [
                {
                    user1Id : userId
                },
                {
                    user2Id : userId
                }
            ]
        });

        if(!threads) {
            return res.status(404).json({ message : "Chưa có cuộc trò chuyện, hãy bắt đầu với ai đó !"});
        }

       

        const threadsFormatted = await Promise.all(threads.map(async(thread) => {
            const user1 =  await User.findById(
                thread.user1Id
            );
            const user2 = await User.findById(
                thread.user2Id
            );
            
            const messages = await Promise.all(thread.msgIds.map(async(msgId) => {
                const msg = await Chat.findOne({
                    _id : msgId
                });
                const plainMsg = msg.toObject();
                
                const dataMsg = {
                    id : plainMsg._id,
                    senderId : plainMsg.senderId,
                    text : plainMsg.text,
                    timestamp : plainMsg.timestamp,
                    seen : plainMsg.seen
                };
                
                return dataMsg;

            }));

            // Không cần sort vì khi thêm vô trong mảng msgIds thì nó đã có thứ tự theo mảng đó rồi, thằng nào thêm sau cuối thì là mới nhất 

            const lastMessage = messages[messages.length - 1];

            const dataThread = {
                threadId : thread._id,
                user1Id : thread.user1Id,
                user2Id : thread.user2Id,
                user1 : {
                    name : user1.name,
                    email : user1.email,
                    avatar : user1.avatar
                },
                user2 : {
                    name : user2.name,
                    email : user2.email,
                    avatar : user2.avatar
                },
                lastMessage,
                messages : messages
            };

            return dataThread;
        }));
        
        const dataSend = {
            id : userId,
            name : user.name,
            email : user.email,
            avatar : user.avatar,
            threads: threadsFormatted
        };

        return res.send(dataSend);
    } catch(error) {
        return res.status(500).json({message : "Server Error !"});
    }
}

// [POST] /api/v1/thread/start
const startMessage = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findOne({
            _id : userId
        });

        if(!user) return res.status(404).json({ message : "Không tìm thấy người dùng!" });

        const sellerId = req.body.sellerId;

        const seller = await User.findOne({
            _id : sellerId
        });

        if(!seller) return res.status(404).json({ message : "Người dùng đã bị cấm hoặc xóa tài khoản !"});

        let thread = await Thread.findOne({
            $or : [
                {
                    user1Id : userId,
                    user2Id : sellerId
                },
                {
                    user1Id : sellerId,
                    user2Id : userId
                }
            ]
        });

        if(!thread) { 
            thread = new Thread({
                user1Id : userId,
                user2Id : sellerId,
                msgIds : []
            });
            await thread.save();
        } 
        
        return res.json({
            message : "Thread ready!",
            threadId : thread._id
        });
    } catch (error) {
        return res.status(500).json({ message : "server error!" });
    }
}

module.exports = {
    getThreadById,
    startMessage
};