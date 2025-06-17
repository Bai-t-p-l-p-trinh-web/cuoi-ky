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
    let { email, name, password } = req.body;

    email = email?.trim();
    name = name?.trim();
    password = password?.trim();

    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, tên và mật khẩu không được bỏ trống.",
        error_code: "VALIDATION_ERROR",
        errors: {
          email: !email ? "Email là bắt buộc" : undefined,
          name: !name ? "Tên là bắt buộc" : undefined,
          password: !password ? "Mật khẩu là bắt buộc" : undefined,
        },
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt.",
        error_code: "WEAK_PASSWORD",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email đã tồn tại trên hệ thống.",
          error_code: "EMAIL_ALREADY_EXISTS",
        });
      } else {
        // Người dùng tồn tại nhưng chưa xác minh, gửi lại OTP
        const otpResult = await sendOtp(existingUser, "VERIFY_ACCOUNT");
        if (otpResult && otpResult.success) {
          return res.status(200).json({
            success: true,
            message:
              "Tài khoản đã tồn tại nhưng chưa được xác minh. OTP mới đã được gửi đến địa chỉ email của bạn.",
            data: {
              actionRequired: "VERIFY_REGISTER",
            },
          });
        } else {
          return res.status(500).json({
            success: false,
            message: "Gửi OTP qua email thất bại. Vui lòng thử lại.",
            error_code: "OTP_SEND_FAILED",
          });
        }
      }
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      isVerified: false,
    });

    const otpSendResult = await sendOtp(newUser, "VERIFY_REGISTER");

    if (otpSendResult && otpSendResult.success) {
      res.status(201).json({
        success: true,
        message:
          "Tài khoản đã được tạo thành công. Mã OTP đã được gửi đến địa chỉ email của bạn để xác thực tài khoản.",
        data: {
          actionRequired: "VERIFY_REGISTER",
        },
      });
    } else {
      res.status(201).json({
        success: true,
        message:
          "Tài khoản đã được tạo thành công, nhưng xảy ra lỗi khi gửi OTP xác thực. Vui lòng thử yêu cầu OTP lại.",
        data: {
          actionRequired: "REQUEST_OTP_AGAIN",
          userId: newUser._id,
        },
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
      error_code: "INTERNAL_SERVER_ERROR",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc mật khẩu không hợp lệ.",
        error_code: "INVALID_CREDENTIALS",
      });
    }
    if (!user.isVerified) {
      const otpSendResult = await sendOtp(user, "VERIFY_ACCOUNT");
      if (otpSendResult && otpSendResult.success) {
        return res.status(200).json({
          success: false,
          message: "Tài khoản chưa xác thực. Mã OTP đã được gửi qua email.",
          error_code: "ACCOUNT_NOT_VERIFIED",
          data: { actionRequired: "VERIFY_FIRST_TIME" },
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Không thể gửi OTP xác thực. Vui lòng thử lại.",
          error_code: "OTP_SEND_FAILED",
        });
      }
    }

    // Kiểm tra 2FA
    if (user.is2FAEnabled) {
      const otpResult = await sendOtp(user, "VERIFY_2FA_LOGIN");
      if (otpResult && otpResult.success) {
        return res.status(200).json({
          success: true,
          message: "Vui lòng nhập mã OTP được gửi đến email của bạn.",
          data: { actionRequired: "VERIFY_2FA_LOGIN" },
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Không thể gửi mã OTP cho 2FA. Vui lòng thử lại.",
          error_code: "2FA_OTP_SEND_FAILED",
        });
      }
    }

    // Nếu không bật 2FA, đăng nhập bình thường
    const tokens = await generateTokens(user); 
    res
      .cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 15, // 15 phút
      })
      .cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
      })
      .status(200)
      .json({
        success: true,
        message: "Đăng nhập thành công.",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            is2FAEnabled: user.is2FAEnabled,
            isVerified: user.isVerified,
          },
          accessToken: tokens.accessToken,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ.",
      error_code: "INTERNAL_SERVER_ERROR",
    });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email và OTP là bắt buộc.",
        error_code: "VALIDATION_ERROR",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại.",
        error_code: "USER_NOT_FOUND",
      });
    }

    // Verify OTP
    const otpVerificationResult = await verifyOtp(
      user,
      otp,
      "VERIFY_2FA_LOGIN"
    );
    if (!otpVerificationResult.success) {
      return res.status(400).json({
        success: false,
        message: otpVerificationResult.message,
        error_code: "INVALID_OTP",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 1000 * 60 * 15,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .status(200)
      .json({
        success: true,
        message: "Xác minh OTP thành công. Đăng nhập hoàn tất.",
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            is2FAEnabled: user.is2FAEnabled,
            isVerified: user.isVerified,
          },
        },
      });
  } catch (error) {
    console.error("Error verifying login OTP:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ.",
      error_code: "INTERNAL_SERVER_ERROR",
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Refresh token là bắt buộc và không được tìm thấy trong cookie.",
        error_code: "MISSING_REFRESH_TOKEN_COOKIE",
      });
    }

    const newTokens = await refreshToken(token);
    if (!newTokens) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
      return res.status(401).json({
        success: false,
        message: "Refresh token không hợp lệ hoặc đã hết hạn.",
        error_code: "INVALID_REFRESH_TOKEN",
      });
    }

    res
      .cookie("accessToken", newTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 15,
      })
      .cookie("refreshToken", newTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .status(200)
      .json({
        success: true,
        message: "Làm mới token thành công.",
        data: {
          accessToken: newTokens.accessToken,
        },
      });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ khi làm mới token.",
      error_code: "INTERNAL_SERVER_ERROR",
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await UserToken.findOneAndDelete({ token: refreshToken });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    console.log("hello");
    res.status(200).json({ success: true, message: "Đăng xuất thành công." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email không được để trống." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng với email này.",
      });
    }

    const otpServiceResult = await sendOtp(user, type);
    if (otpServiceResult?.success) {
      return res
        .status(200)
        .json({ success: true, message: "OTP đã được gửi thành công." });
    }

    return res
      .status(500)
      .json({ success: false, message: "Gửi OTP thất bại. Vui lòng thử lại." });
  } catch (error) {
    console.error("Controller Send OTP error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, type } = req.body;
    const user = await User.findOne({
      $or: [{ email }, { pendingEmail: email }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng." });
    }

    const result = await verifyOtp(user, otp, type);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    if (result.success && type === "VERIFY_FIRST_TIME") {
      return res
        .cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 1000 * 60 * 15,
        })
        .cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        })
        .status(200)
        .json({
          success: true,
          message: result.message,
          data: { ...result.data, userId: user._id, verificationType: type },
        });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: { userId: user._id, verificationType: type },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bắt buộc." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại." });
    }

    if (newPassword === oldPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không được trùng với mật khẩu cũ.",
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Mật khẩu mới phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt.",
      });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu cũ không đúng." });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Đổi mật khẩu thành công." });
  } catch (error) {
    console.error("Error changing password:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { oldEmail, newEmail } = req.body;

    if (!oldEmail || !newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu email cũ hoặc mới." });
    }

    if (oldEmail === newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email mới phải khác email cũ." });
    }

    const existed = await User.findOne({ email: newEmail });
    if (existed) {
      return res
        .status(400)
        .json({ success: false, message: "Email mới đã được sử dụng." });
    }

    const user = await User.findOne({ email: oldEmail });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng." });
    }

    user.pendingEmail = newEmail;
    await user.save();

    const otpResult = await sendOtp(user, "VERIFY_NEW_EMAIL");

    if (otpResult?.success) {
      return res.status(200).json({
        success: true,
        message: "Đã gửi OTP xác thực đến email mới.",
        data: { actionRequired: "VERIFY_NEW_EMAIL" },
      });
    }

    user.pendingEmail = null;
    await user.save();
    return res.status(500).json({
      success: false,
      message: "Không thể gửi OTP. Vui lòng thử lại.",
    });
  } catch (error) {
    console.error("Change email error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu userId hoặc mật khẩu mới." });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Mật khẩu mới phải có ít nhất 8 ký tự, 1 chữ hoa và 1 ký tự đặc biệt.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại." });
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Đặt lại mật khẩu thành công." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

exports.toggle2FA = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Người dùng chưa được xác thực." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại." });
    }

    user.is2FAEnabled = !user.is2FAEnabled;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.is2FAEnabled
        ? "Đã bật tính năng đăng nhập hai lớp."
        : "Đã tắt tính năng đăng nhập hai lớp.",
      data: { is2FAEnabled: user.is2FAEnabled },
    });
  } catch (error) {
    console.error("Toggle 2FA error:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};
