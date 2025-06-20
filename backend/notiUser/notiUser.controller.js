const User = require('../user/user.model');
const Notificate = require('./notiUser.model');

const getNotices = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({ message : "Không tìm thấy người dùng!"});
        let notices = await Notificate.find({
            userId : userId
        });


        notices = notices.map((notice) => ({
            content : notice.content,
            createdAt : notice.createdAt
        }));

        return res.send(notices);
    } catch(error) {
        return res.status(500).json({ message : "Server Error!" });
    }
}

module.exports = {
    getNotices
}