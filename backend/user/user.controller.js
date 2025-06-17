const { hashPassword } = require("../auth/auth.services");
const User = require("./user.model");
const bcrypt = require("bcrypt");
// [GET] /api/v1/user/me
const getInfoMe = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "token không hợp lệ!" });
    }
    const user = await User.findOne({
      _id: userId,
    }).select(
      "email name role avatar _id phone createdAt address city district isVerified is2FAEnabled hasSetPassword isOAuthUser contactFacebook contactEmail contactZalo contactLinkedin"
    );
    if (!user) {
      return res.status(404).json({ message: "không tìm thấy user!" });
    }
    if (!user.phone) user.phone = "";
    if (!user.address) user.address = "";
    if (!user.city) user.city = "";
    if (!user.district) user.district = "";
    return res.send(user);
  } catch (error) {
    return res.status(500).json({ message: "Server Error!" });
  }
};

// [POST] /api/v1/user/logout
const LogoutMe = async (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });

  return res.status(200).json({ message: "Đăng xuất thành công !" });
};

// [PATCH] /api/v1/user/me - Update basic profile info
const updateInfoMe = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const {
      name,
      phone,
      address,
      city,
      district,
      avatar,
      contactFacebook,
      contactZalo,
      contactEmail,
      contactLinkedin,
    } = req.body;

    const updatedInfo = {};

    // Chỉ update những trường được gửi lên và không phải null/undefined/empty string
    if (name !== undefined && name !== null) updatedInfo.name = name;
    if (phone !== undefined && phone !== null) updatedInfo.phone = phone;
    if (address !== undefined && address !== null)
      updatedInfo.address = address;
    if (city !== undefined && city !== null) updatedInfo.city = city;
    if (district !== undefined && district !== null)
      updatedInfo.district = district;
    if (avatar !== undefined && avatar !== null && avatar !== "")
      updatedInfo.avatar = avatar;
    if (contactFacebook !== undefined && contactFacebook !== null)
      updatedInfo.contactFacebook = contactFacebook;
    if (contactZalo !== undefined && contactZalo !== null)
      updatedInfo.contactZalo = contactZalo;
    if (contactEmail !== undefined && contactEmail !== null)
      updatedInfo.contactEmail = contactEmail;
    if (contactLinkedin !== undefined && contactLinkedin !== null)
      updatedInfo.contactLinkedin = contactLinkedin;

    await User.findByIdAndUpdate(userId, updatedInfo);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: updatedInfo,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi cập nhật thông tin!",
    });
  }
};

module.exports = {
  getInfoMe,
  LogoutMe,
  updateInfoMe,
};
