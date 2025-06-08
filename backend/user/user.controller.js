const { hashPassword } = require('../auth/auth.services');
const User = require('./user.model');
const bcrypt = require('bcrypt');
// [GET] /api/v1/user/me
const getInfoMe = async(req, res) => {
    try {
        const userId = req.userId;

        if(!userId) {
            return res.status(401).json({ message : "token không hợp lệ!"});
        }
        const user = await User.findOne({
            _id : userId
        }).select("email name role avatar _id phone createdAt contactFacebook contactEmail contactZalo contactLinkedin");
        if(!user) {
            return res.status(404).json({ message : "không tìm thấy user!"});
        }
        if(!user.phone) user.phone = "";
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

// [PATH] /api/v1/user/me 
const updateInfoMe = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json( { message : "Không tìm thấy người dùng" } );
        }

        const { oldPassword, newPassword, avatar, contactFacebook, contactZalo, contactEmail, contactLinkedin } = req.body;

        const updatedInfo = {

        };

        if (oldPassword) {
            const hashedOldPassword = await hashPassword(oldPassword);
            const isMatch = await bcrypt.compare(hashedOldPassword, user.password);
            if(isMatch){
                return res.status(401).json({ message : "Sai mật khẩu, vui lòng nhập lại mật khẩu" });
            }

            const hashedNewPassword = await hashPassword(newPassword);

            updatedInfo.password = hashedNewPassword;
        }

        if(avatar) {
            updatedInfo.avatar = avatar;
        }

        if(contactFacebook) {
            updatedInfo.contactFacebook = contactFacebook;
        }

        if(contactZalo) {
            updatedInfo.contactZalo = contactZalo;
        }

        if(contactEmail) {
            updatedInfo.contactEmail = contactEmail;
        }

        if(contactLinkedin) {
            updatedInfo.contactLinkedin = contactLinkedin;
        }
        
        await User.findByIdAndUpdate(userId, updatedInfo);

        return res.send('Cập nhật thành công');

    } catch (error) {
        return res.status(500).json({ message : "Server Error!"});
    }
}

module.exports = {
    getInfoMe,
    LogoutMe,
    updateInfoMe
}