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
    if (address !== undefined && address !== null) updatedInfo.address = address;
    if (city !== undefined && city !== null) updatedInfo.city = city;
    if (district !== undefined && district !== null) updatedInfo.district = district;
    if (avatar !== undefined && avatar !== null && avatar !== "") updatedInfo.avatar = avatar;
    if (contactFacebook !== undefined && contactFacebook !== null) updatedInfo.contactFacebook = contactFacebook;
    if (contactZalo !== undefined && contactZalo !== null) updatedInfo.contactZalo = contactZalo;
    if (contactEmail !== undefined && contactEmail !== null) updatedInfo.contactEmail = contactEmail;
    if (contactLinkedin !== undefined && contactLinkedin !== null) updatedInfo.contactLinkedin = contactLinkedin;

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

// [PATCH] /api/v1/user/seller 
const handleBecomeSeller = async(req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if(!user) {
      return res.status(404).json({ message : "Không tìm thấy người dùng !"});
    }

    if(user.role !== "user") {
      return res.status(403).json({ message : "User phải là người dùng để trở thành người bán! " });
    }

   
    if(!user.name) return res.status(400).json({ message: "Vui lòng cập nhật họ tên." });
    if(!user.avatar) return res.status(400).json({ message: "Vui lòng cập nhật ảnh đại diện." });
    if(!user.email) return res.status(400).json({ message: "Vui lòng cập nhật email." });
    if(!user.phone) return res.status(400).json({ message: "Vui lòng cập nhật số điện thoại." });
    if(!user.address) return res.status(400).json({ message: "Vui lòng cập nhật địa chỉ." });
    if(!user.city) return res.status(400).json({ message: "Vui lòng cập nhật tỉnh/thành phố." });
    if(!user.district) return res.status(400).json({ message: "Vui lòng cập nhật quận/huyện." });
    if(!user.contactEmail) return res.status(400).json({ message: "Vui lòng cập nhật email liên hệ." });
    if(!user.contactFacebook) return res.status(400).json({ message: "Vui lòng cập nhật Facebook liên hệ." });
    if(!user.contactLinkedin) return res.status(400).json({ message: "Vui lòng cập nhật LinkedIn liên hệ." });
    if(!user.contactZalo) return res.status(400).json({ message: "Vui lòng cập nhật Zalo liên hệ." });
    if(!user.isVerified) return res.status(403).json({ message : "Người dùng chưa xác thực!" });


    user.role = "seller";
    await user.save();
    return res.status(200).json({ message : "Chuyển thành người bán thành công!" });
  } catch(error) {
    return res.status(500).json({ message : "Server Error!" });
  }
}

// [GET] /api/v1/user/:slugSeller 
const getSellerBySlug = async(req, res) => {
  try {
    const sellerSlug = req.params.slugSeller;
    const seller = await User.findOne({
      slug: sellerSlug,
      role: "seller"
    }).select("-_id -password -isVerified -is2FAEnabled -__v -updatedAt -pendingEmail");

    if(!seller) {
      return res.status(404).json({ message : "Không tìm thấy người bán!" });
    }

    return res.status(200).json(seller);
  } catch(error) {
    return res.status(500).json({ message : "Server Error!" });
  }
}

module.exports = {
  getInfoMe,
  LogoutMe,
  updateInfoMe,
  handleBecomeSeller,
  getSellerBySlug
};
