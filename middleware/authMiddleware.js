const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Token tekshirish
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Kirish uchun avval tizimga kiring",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Foydalanuvchi topilmadi",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Hisobingiz bloklangan",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token noto'g'ri yoki muddati tugagan",
    });
  }
};

// Admin tekshirish
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Bu amalni faqat admin bajarishi mumkin",
    });
  }
  next();
};

// Teacher yoki Admin tekshirish
const teacherOrAdmin = (req, res, next) => {
  if (!["teacher", "admin"].includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      message: "Bu amalni faqat o'qituvchi yoki admin bajarishi mumkin",
    });
  }
  next();
};

module.exports = { protect, adminOnly, teacherOrAdmin };
