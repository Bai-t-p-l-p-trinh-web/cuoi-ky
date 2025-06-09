const User = require("../user/user.model");
const UserToken = require("../userToken/userToken.model");
const { sendOtp, verifyOtp } = require("./auth.services");
const {
  hashPassword,
  comparePassword,
  validatePassword,
  generateTokens,
  refreshToken,
} = require("./auth.services");

exports.register = async (req, res) => {
  try {
    let { email, phoneNumber, name, password } = req.body;

    email = email?.trim();
    phoneNumber = phoneNumber?.trim();
    name = name?.trim();
    password = password?.trim();

    // Validate required fields
    if (!email || !phoneNumber || !name || !password) {
      return res.status(400).json({
        message: "Email, số điện thoại, tên và mật khẩu không được bỏ trống",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res
          .status(400)
          .json({ message: "Email đã tồn tại trên hệ thống" });
      } else {
        // Người dùng tồn tại nhưng chưa xác minh, gửi lại OTP
        const otpResult = await sendOtp(existingUser, "register");
        if (otpResult && otpResult.success) {
          return res.status(200).json({
            message:
              "Tài khoản đã tồn tại nhưng chưa được xác minh. OTP mới đã được gửi đến địa chỉ email của bạn.",
            actionRequired: "VERIFY_ACCOUNT",
          });
        } else {
          return res
            .status(500)
            .json({ message: "Gửi OTP qua email thất bại. Vui lòng thử lại." });
        }
      }
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      email,
      phoneNumber,
      name,
      password: hashedPassword,
      isVerified: false,
    });

    const otpSendResult = await sendOtp(newUser, "register");

    if (otpSendResult && otpSendResult.success) {
      res.status(201).json({
        message:
          "Tài khoản đã được tạo thành công. Mã OTP đã được gửi đến địa chỉ email của bạn để xác thực tài khoản.",
        actionRequired: "VERIFY_ACCOUNT",
      });
    } else {
      res.status(201).json({
        message:
          "Tài khoản đã được tạo thành công, nhưng xảy ra lỗi khi gửi OTP xác thực. Vui lòng thử yêu cầu OTP lại.",
        actionRequired: "REQUEST_OTP_AGAIN",
        userId: newUser._id,
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await comparePassword(password, user.password))) {
      return res
        .status(400)
        .json({ message: "Email đăng nhập hoặc mật khẩu không hợp lệ" });
    }
    if (!user.isVerified) {
      const otpSendResult = await sendOtp(user, "register");
      if (otpSendResult && otpSendResult.success) {
        return res.status(403).json({
          message: "Tài khoản chưa được xác thực. OTP đã được gửi qua email.",
          actionRequired: "VERIFY_ACCOUNT",
        });
      } else {
        return res.status(500).json({
          message: "Lỗi gửi OTP xác thực tài khoản. Vui lòng thử lại.",
        });
      }
    }

    // Kiểm tra 2FA
    if (user.is2FAEnabled) {
      const otpResult = await sendOtp(user, "2fa");
      if (otpResult && otpResult.success) {
        return res.status(200).json({
          message:
            "Yêu cầu đăng nhập 2 yếu tố. Vui lòng nhập mã OTP đã được gửi đến email của bạn.",
          actionRequired: "VERIFY_2FA_OTP",
        });
      } else {
        return res
          .status(500)
          .json({ message: "Không thể gửi mã OTP cho 2FA. Vui lòng thử lại." });
      }
    }

    // Nếu không bật 2FA, đăng nhập bình thường
    const tokens = await generateTokens(user);
    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email và OTP không được để trống." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Verify OTP
    const otpVerificationResult = await verifyOtp(user, otp, "2fa");

    if (!otpVerificationResult.success) {
      return res.status(400).json({ message: otpVerificationResult.message });
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(200).json({
      message: "Xác minh OTP thành công, đăng nhập thành công.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        is2FAEnabled: user.is2FAEnabled,
      },
    });
  } catch (error) {
    console.error("Error verifying login OTP:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const tokens = await refreshToken(token);
    if (!tokens) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    res.json(tokens);
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Delete the refresh token from database
    await UserToken.findOneAndDelete({ token: refreshToken });

    res.json({ message: "Đăng xuất thành công." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email không được để trống" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với email này.",
      });
    }

    const otpServiceResult = await sendOtp(user, type);

    if (otpServiceResult && otpServiceResult.success) {
      return res
        .status(200)
        .json({ success: true, message: "OTP đã được gửi thành công." });
    } else {
      return res.status(500).json({
        success: false,
        message: "Gửi OTP thất bại. Vui lòng thử lại.",
      });
    }
  } catch (error) {
    console.error("Controller Send OTP error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    const user = await User.findOne({
      $or: [{ email: email }, { pendingEmail: email }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await verifyOtp(user, otp, type);
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    return res.status(200).json({
      message: result.message,
      verificationType: type,
      success: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Người dùng chưa được xác thực." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const currentPassword = user.password;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới và mật khẩu cũ không được để trống.",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Mật khẩu mới phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt.",
      });
    }

    if (newPassword === oldPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới không được giống mật khẩu cũ.",
      });
    }

    if (!(await comparePassword(oldPassword, currentPassword))) {
      return res.status(400).json({
        message: "Mật khẩu cũ không đúng",
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    res.status(200).json({
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { oldEmail, newEmail } = req.body;

    if (!oldEmail || !newEmail) {
      return res
        .status(400)
        .json({ message: "Email cũ và email mới không được để trống." });
    }

    if (oldEmail === newEmail) {
      return res.status(400).json({ message: "Email mới phải khác email cũ." });
    }

    // Check if the new email is already in use by another verified user
    const existingUserWithNewEmail = await User.findOne({ email: newEmail });
    if (existingUserWithNewEmail) {
      return res.status(400).json({ message: "Email này đã được sử dụng." });
    }

    const user = await User.findOne({ email: oldEmail });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng với email hiện tại." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { pendingEmail: newEmail },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng để cập nhật email." });
    }

    const otpResult = await sendOtp(updatedUser, "verify-new-email");

    if (otpResult && otpResult.success) {
      return res.status(200).json({
        message:
          "Mã OTP đã được gửi đến địa chỉ email mới. Vui lòng xác thực để hoàn tất thay đổi email.",
        actionRequired: "VERIFY_NEW_EMAIL",
      });
    } else {
      // Rollback pendingEmail if OTP sending fails
      await User.findByIdAndUpdate(updatedUser._id, { pendingEmail: null });
      return res.status(500).json({
        message: "Gửi OTP xác thực email mới thất bại. Vui lòng thử lại.",
      });
    }
  } catch (error) {
    console.error("Change email error:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ khi xử lý yêu cầu thay đổi email.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "User ID không được để trống." });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới không được để trống.",
      });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Mật khẩu mới phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const hashedPassword = await hashPassword(newPassword);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Không thể đặt lại mật khẩu cho người dùng này." });
    }
    res.status(200).json({
      message: "Đặt lại mật khẩu thành công.",
    });
  } catch (error) {
    console.error("Error reset password:", error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

exports.toggle2FA = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Người dùng chưa được xác thực." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const is2FAEnabled = user.is2FAEnabled;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        is2FAEnabled: !is2FAEnabled,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "Không thể cập nhật trạng thái 2FA cho người dùng." });
    }
    res.status(200).json({
      message: updatedUser.is2FAEnabled
        ? "Đã bật tính năng đăng nhập hai lớp."
        : "Đã tắt tính năng đăng nhập hai lớp.",
      is2FAEnabled: updatedUser.is2FAEnabled, // Trả về trạng thái mới
    });
  } catch (error) {
    console.error("Error toggle 2FA:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
