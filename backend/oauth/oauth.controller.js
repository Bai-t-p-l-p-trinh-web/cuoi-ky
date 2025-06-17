const axios = require("axios");
const jwt = require("jsonwebtoken");

const User = require("../user/user.model");

const { generateRandomString } = require("../utils/generate");
const { hashPassword, generateTokens } = require("../auth/auth.services");

// {code} => {id_token, access_token}
const getOauthGoogleToken = async (code) => {
  const body = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  const { data } = await axios.post(
    "https://oauth2.googleapis.com/token",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return data;
};

// {id_token, access_token} => {profile user}
const getDataUserFromToken = async ({ id_token, access_token }) => {
  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    {
      params: {
        access_token,
        alt: "json",
      },
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  );
  return data;
};

// [GET] /api/v1/oauth/google
const getRepondsByGoogle = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_cancelled`
      );
    }

    const data = await getOauthGoogleToken(code);
    const { id_token, access_token } = data;
    const googleUser = await getDataUserFromToken({ id_token, access_token });
    if (!googleUser.verified_email) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=email_not_verified`
      );
    }

    try {
      let user = await User.findOne({
        email: googleUser.email,
      });

      // chưa có user thì tạo user mới
      if (!user) {
        try {
          user = await User.create({
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            password: generateRandomString(50),
            isVerified: true,
            isOAuthUser: true,
            hasSetPassword: false,
          });

          const tempToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
          );

          res.cookie("temp_oauth_token", tempToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 10 * 60 * 1000,
          });

          res.redirect(`${process.env.CLIENT_URL}/fill-info`);
        } catch (error) {
          console.error("Error creating user:", error);
          return res.redirect(
            `${process.env.CLIENT_URL}/login?error=user_creation_failed`
          );
        }
      } else {
        // Có rồi thì đăng nhập
        const tokens = await generateTokens(user);
        res.cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 1000 * 60 * 15,
        });

        res.cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        // Tạo một URL với user data để frontend có thể lấy được
        const userData = {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role || "user",
          is2FAEnabled: user.is2FAEnabled || false,
          isVerified: user.isVerified || true,
          isOAuthUser: user.isOAuthUser || false,
          hasSetPassword: user.hasSetPassword || false,
          avatar: user.avatar,
        };

        const encodedUserData = encodeURIComponent(JSON.stringify(userData));
        return res.redirect(
          `${process.env.CLIENT_URL}?oauth_success=true&user=${encodedUserData}`
        );
      }
    } catch (error) {
      console.error("OAuth error:", error);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  } catch (error) {
    console.error("OAuth Google error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
};

// [GET] /api/v1/oauth/tempUser
const getTempUser = async (req, res) => {
  const token = req.cookies.temp_oauth_token;
  if (!token) return res.status(401).json({ message: "Chưa xác thực Google" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: payload.userId,
    });

    if (!user) {
      return res.status(400).json({ message: "Người dùng không hợp lệ" });
    }

    return res.send({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// [POST] /api/v1/oauth/updateUser
const updateUser = async (req, res) => {
  try {
    const token = req.cookies.temp_oauth_token;
    console.log("OAuth updateUser - token:", !!token); // Debug log

    if (!token)
      return res.status(401).json({ message: "Chưa xác thực Google" });

    const { name, phone, email, avatar } = req.body;
    console.log("OAuth updateUser - received data:", {
      name,
      phone,
      email,
      avatar,
    }); // Debug log

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log("OAuth updateUser - payload:", payload); // Debug log

    // OAuth users không cần password - chỉ update thông tin cơ bản
    const updateData = {
      name,
      phone,
      avatar,
    };

    const updateUser = await User.findByIdAndUpdate(
      payload.userId,
      updateData,
      {
        new: true,
      }
    );

    if (!updateUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng " });
    }

    const tokens = await generateTokens(updateUser);
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    // Clear temp token
    res.clearCookie("temp_oauth_token");

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin người dùng thành công!",
      data: {
        user: {
          id: updateUser._id,
          email: updateUser.email,
          name: updateUser.name,
          role: updateUser.role || "user",
          is2FAEnabled: updateUser.is2FAEnabled || false,
          isVerified: updateUser.isVerified || true,
          isOAuthUser: updateUser.isOAuthUser || false,
          hasSetPassword: updateUser.hasSetPassword || false,
          avatar: updateUser.avatar,
        },
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server Error!" });
  }
};

module.exports = {
  getRepondsByGoogle,
  getTempUser,
  updateUser,
};
