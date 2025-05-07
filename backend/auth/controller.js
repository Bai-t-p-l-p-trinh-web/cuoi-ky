const User = require("../user/model");
const { hashPassword, comparePassword, generateTokens } = require("./services");

exports.register = async (req, res) => {
  const { email, name, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await hashPassword(password);
  await User.create({ email, name, password: hashedPassword });
  res.status(201).json({ message: "User created successfully" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateTokens(user);
  res.json({
    token,
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
  });
};
