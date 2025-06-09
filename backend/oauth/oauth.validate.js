const validateOauthFillInfo = (req, res, next) => {
    const { name, email, password, phone, avatar } = req.body;

    if( !name || name.trim() === "") {
        return res.status(400).json({ message : "Tên không được để trống "});
    }

    if (!email || email.trim() === "") {
        return res.status(400).json({ message: "Email không được để trống" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ" });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    if (!phone || phone.trim() === "") {
        return res.status(400).json({ message: "Số điện thoại không được để trống" });
    }

    const phoneRegex = /^[0-9]{9,12}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }

    next();
}

module.exports = {
    validateOauthFillInfo
}