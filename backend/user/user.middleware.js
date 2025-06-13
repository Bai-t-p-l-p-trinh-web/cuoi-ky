const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies.access_token;  

  if (!token) {
    return res.status(401).json({ message: "không có token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;  
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

function verifyTokenButDontRequired(req, res, next) {
  const token = req.cookies.access_token;  


  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;  
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = {
  verifyToken,
  verifyTokenButDontRequired
}