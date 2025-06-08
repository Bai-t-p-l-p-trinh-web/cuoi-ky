const User = require('./user.model');
// [GET] /api/v1/user/me
const getInfoMe = async(req, res) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(401).json({ message : "token không hợp lệ!"});
        }
        const user = await User.findOne({
            _id : userId
        }).select("email name role avatar _id");
        if(!user) {
            return res.status(404).json({ message : "không tìm thấy user!"});
        }
        return res.send(user);
    } catch (error) {
        return res.status(500).json({ message : "Server Error!"});
    }
}


// [POST] /api/v1/user/logout 
const LogoutMe = async (req, res) => {
    
    res.clearCookie('access_token', {
        httpOnly : true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax"
    });

    return res.status(200).json({ message : "Đăng xuất thành công !"});
}

module.exports = {
    getInfoMe,
    LogoutMe
}