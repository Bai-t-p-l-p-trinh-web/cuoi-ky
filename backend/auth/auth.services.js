const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../user/user.model");
const Otp = require("../otp/otp.model");
const UserToken = require("../userToken/userToken.model");
const {
  generateOtpCode,
  generateOtpEmailTemplate,
} = require("../otp/otp.controller");
const nodemailer = require("nodemailer");
const regex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

exports.hashPassword = async (password) => await bcrypt.hash(password, 10);

exports.comparePassword = async (raw, hash) => await bcrypt.compare(raw, hash);

exports.validatePassword = (password) => {
  if (regex.test(password)) {
    return true;
  } else {
    console.log("Invalid password");
    return false;
  }
};

exports.generateTokens = async (user) => {
  try {
    // Delete all existing refresh tokens for this user
    await UserToken.deleteMany({ userId: user._id });

    // Create access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token in database
    const userToken = new UserToken({
      userId: user._id,
      token: refreshToken,
    });
    await userToken.save();

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw error;
  }
};

exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

exports.refreshToken = async (refreshToken) => {
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if token exists in database
    const storedToken = await UserToken.findOne({
      userId: decoded.id,
      token: refreshToken,
    });

    if (!storedToken) {
      return null; // Token not found in database or revoked
    }

    // Delete the old refresh token (token rotation for security)
    await UserToken.findByIdAndDelete(storedToken._id);

    // Generate new access token
    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate new refresh token (token rotation)
    const newRefreshToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save the new refresh token in database
    const userToken = new UserToken({
      userId: decoded.id,
      token: newRefreshToken,
    });
    await userToken.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

exports.sendOtp = async (user, type) => {
  try {
    const newOtp = generateOtpCode().toString();
    const hashedOtp = await bcrypt.hash(newOtp, 10);
    const existingOtp = await Otp.findOne({ userId: user._id });

    if (existingOtp) {
      await Otp.findByIdAndUpdate(existingOtp._id, {
        otp: hashedOtp,
        createdAt: new Date(),
        expiredAt: new Date(Date.now() + 3 * 60 * 1000),
      });
    } else {
      await Otp.create({
        userId: user._id,
        otp: hashedOtp,
        createdAt: new Date(),
        expiredAt: new Date(Date.now() + 3 * 60 * 1000),
      });
    }

    // generate email and send email
    const emailTemplate = generateOtpEmailTemplate(newOtp, type, user.name);

    // configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailSubject;
    switch (type) {
      case "VERIFY_REGISTER":
        mailSubject = "Xác nhận đăng ký tài khoản";
        break;
      case "VERIFY_CHANGE_PASSWORD":
        mailSubject = "Xác nhận thay đổi mật khẩu";
        break;
      case "VERIFY_RESET_PASSWORD":
        mailSubject = "Xác nhận quên mật khẩu";
        break;
      case "VERIFY_CURRENT_EMAIL":
      case "VERIFY_NEW_EMAIL":
        mailSubject = "Xác nhận thay đổi địa chỉ Email";
        break;
      case "VERIFY_2FA_LOGIN":
        mailSubject = "Xác nhận đăng nhập 2 yếu tố";
        break;
      case "VERIFY_ACCOUNT":
        mailSubject = "Xác nhận địa chỉ Email";
        break;
      case "REQUEST_OTP_AGAIN":
        mailSubject = "Gửi lại mã OTP mới";
        break;
    }

    // send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: type === "VERIFY_NEW_EMAIL" ? user.pendingEmail : user.email,
      subject: mailSubject,
      html: emailTemplate,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

exports.verifyOtp = async (user, inputOtp, type) => {
  try {
    const otp = await Otp.findOne({ userId: user._id });
    if (!otp) {
      return {
        success: false,
        message:
          "Không tìm thấy OTP cho tài khoản này. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Check if OTP is expired
    if (new Date() > otp.expiredAt) {
      // Delete expired OTP
      await Otp.findByIdAndDelete(otp._id);
      return {
        success: false,
        message: "OTP đã hết hạn. Vui lòng yêu cầu OTP mới.",
      };
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(inputOtp, otp.otp);

    if (isOtpValid) {
      // Delete OTP after successful verification
      await Otp.findByIdAndDelete(otp._id);

      switch (type) {
        case "VERIFY_REGISTER":
          await User.findByIdAndUpdate(user._id, { isVerified: true });
          break;
        case "VERIFY_FIRST_TIME":
          await User.findByIdAndUpdate(user._id, { isVerified: true });
          const { accessToken, refreshToken } = await exports.generateTokens(
            user
          );
          return {
            accessToken,
            refreshToken,
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
          };
        case "VERIFY_NEW_EMAIL":
          const newEmail = user.pendingEmail;
          console.log(newEmail);
          await User.findByIdAndUpdate(user._id, {
            email: newEmail,
            pendingEmail: null,
          });
      }
      return { success: true, message: "Xác minh OTP thành công." };
    } else {
      return { success: false, message: "OTP không hợp lệ." };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "Đã xảy ra lỗi trong quá trình xác minh OTP.",
    };
  }
};
