const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.hashPassword = async (password) => await bcrypt.hash(password, 10);
exports.comparePassword = async (raw, hash) => await bcrypt.compare(raw, hash);

exports.generateTokens = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
