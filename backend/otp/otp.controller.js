exports.generateOtpCode = () => {
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  return otpCode.toString();
};

exports.generateOtpEmailTemplate = (otp, type, userName) => {
  let title = "",
    message = "";

  switch (type) {
    case "VERIFY_REGISTER":
      title = "Xác minh địa chỉ email";
      message = `Cảm ơn bạn đã đăng ký tài khoản tại trang web <strong>FakeAuto</strong> của chúng tôi!<br />
        Vui lòng sử dụng mã OTP dưới đây để xác minh địa chỉ email và hoàn tất đăng ký.`;
      break;
    case "VERIFY_ACCOUNT":
      title = "Xác minh địa chỉ email";
      message = `Tài khoản của bạn hiện chưa được kích hoạt.<br />
        Vui lòng nhập mã OTP dưới đây để xác minh địa chỉ email và kích hoạt tài khoản.`;
      break;
    case "VERIFY_2FA_LOGIN":
      title = "Mã xác thực đăng nhập 2 yếu tố (2FA)";
      message = `Chúng tôi phát hiện một lần đăng nhập mới vào tài khoản của bạn.<br />
        Vui lòng nhập mã OTP bên dưới để xác minh và tiếp tục đăng nhập.`;
      break;
    case "VERIFY_CHANGE_EMAIL":
      title = "Xác nhận thay đổi địa chỉ Email";
      message = `Bạn đã yêu cầu thay đổi địa chỉ Email hiện tại sang địa chỉ Email mới.<br />
        Vui lòng sử dụng mã OTP dưới đây để xác nhận thao tác này và hoàn tất việc cập nhật địa chỉ Email.`;
      break;
    case "VERIFY_NEW_EMAIL":
      title = "Xác nhận địa chỉ Email mới";
      message = `Bạn đang thêm địa chỉ Email mới cho tài khoản của mình.<br />
        Vui lòng sử dụng mã OTP dưới đây để xác nhận địa chỉ Email này và kích hoạt tính năng bảo mật cho tài khoản.`;
      break;
    case "VERIFY_RESET_PASSWORD":
      title = "Xác nhận quên mật khẩu";
      message = `Bạn đã yêu cầu tạo lại mật khẩu do quên mật khẩu.<br />
         Vui lòng sử dụng mã OTP dưới đây để xác nhận thao tác này.`;
      break;
    case "REQUEST_OTP_AGAIN":
      title = "Yêu cầu gửi lại mã OTP";
      message = `Bạn vừa yêu cầu gửi lại mã OTP.<br />
        Vui lòng sử dụng mã OTP mới bên dưới để hoàn tất thao tác của bạn.<br />`;
      break;
  }

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Mã OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b1426;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #e1e3e8;
    }
    .container {
      max-width: 480px;
      background-color: #131a36;
      margin: 40px auto;
      border-radius: 12px;
      padding: 30px 40px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo img {
      max-height: 40px;
      object-fit: contain;
    }
    h2 {
      margin-top: 0;
      font-weight: 600;
      font-size: 22px;
      text-align: center;
      color: #ffffff;
    }
    p.message {
      font-size: 16px;
      margin: 15px 0 25px;
      text-align: center;
      color: #a0a8c4;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #4ee1ff;
      text-align: center;
      letter-spacing: 12px;
      margin: 15px 0 15px;
      user-select: all;
    }
    .expiry {
      text-align: center;
      font-size: 14px;
      color: #8fa0bf;
      margin-bottom: 30px;
    }
    .warning {
      font-size: 13px;
      color: #f45b5b;
      background-color: #3a1e1e;
      border-radius: 6px;
      padding: 15px 20px;
      margin: 0 10px;
      text-align: center;
      line-height: 1.4;
    }
    @media (max-width: 520px) {
      .container {
        padding: 20px;
        margin: 20px 10px;
      }
      .otp-code {
        font-size: 28px;
        letter-spacing: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container" role="main">    
    <div class="logo">
      <img src="${process.env.LOGO_URL}" alt="FakeAuto Logo" />
    </div>
    <h2>Xin chào ${userName},</h2>
    <p class="message">${message}</p>
    <div class="otp-code">${otp}</div>
    <p class="expiry">Mã này sẽ hết hạn sau 3 phút.</p>
    <div class="warning">
      Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email hoặc liên hệ bộ phận hỗ trợ.
    </div>
  </div>
</body>
</html>
  `;
};
