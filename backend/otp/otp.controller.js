exports.generateOtpCode = () => {
  const otpCode = Math.floor(100000 + Math.random() * 900000);
  return otpCode.toString();
};

exports.generateOtpEmailTemplate = (otp, type, userName) => {
  let title = "",
    message = "";

  switch (type) {
    case "register":
      title = "Xác minh địa chỉ email";
      message = `Cảm ơn bạn đã đăng ký tài khoản tại trang web <strong>FakeAuto</strong> của chúng tôi!<br />
        Vui lòng sử dụng mã OTP sau để xác minh email.`;
      break;
    case "verification":
      title = "Xác minh địa chỉ email";
      message = `Tài khoản của bạn chưa được kích hoạt<br />
        Vui lòng sử dụng mã OTP sau để xác minh email.`;
    case "2fa":
      title = "Mã đăng nhập 2 yêu tố (2FA)";
      message = `Chúng tôi phát hiện một đăng nhập mới.<br />
        Vui lòng nhập mã OTP bên dưới để tiếp tục`;
      break;
    case "change-email":
      title = "Xác nhận thay đổi email";
      message = `Bạn đã yêu cầu thay đổi địa chỉ email.<br />
        Hãy sử dụng mã OTP dưới đây để xác nhận.`;
      break;
  }

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f8fa;
          padding: 20px;
        }
        .container {
          background-color: #fff;
          max-width: 500px;
          margin: auto;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #2b6cb0;
          margin: 20px 0;
        }
        .footer {
          font-size: 13px;
          color: #718096;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Chào ${userName},</h2>
        <p>${message}</p>
        <div class="otp">${otp}</div>
        <p>Mã sẽ hết hạn sau 3 phút.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với chúng tôi.</p>
        <div class="footer">
          Trân trọng,<br />
          Đội ngũ FakeAuto
        </div>
      </div>
    </body>
  </html>
  `;
};
