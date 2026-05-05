const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Token yaratish
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── POST /api/auth/register ──────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, phone, password, role = "student" } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Ism, telefon va parol majburiy",
      });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan",
      });
    }

    const normalizedRole = role === "teacher" ? "teacher" : "student";
    const user = await User.create({ name, phone, password, role: normalizedRole });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        enrolledCourses: user.enrolledCourses,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Telefon va parol majburiy",
      });
    }

    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Telefon raqam yoki parol noto'g'ri",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Telefon raqam yoki parol noto'g'ri",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Hisobingiz bloklangan. Admin bilan bog'laning",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Muvaffaqiyatli kirdingiz",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        enrolledCourses: user.enrolledCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "enrolledCourses",
      "title category price image"
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── PUT /api/auth/me ─────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) {
      // Telefon band emasligini tekshirish
      const exists = await User.findOne({ phone, _id: { $ne: req.user._id } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Bu telefon raqam allaqachon ishlatilmoqda",
        });
      }
      updateData.phone = phone;
    }

    // Avatar yuklangan bo'lsa
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Ma'lumotlar yangilandi", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── PUT /api/auth/change-password ───────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Joriy va yangi parol majburiy",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Yangi parol kamida 6 ta belgi bo'lishi kerak",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Joriy parol noto'g'ri",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { register, login, getMe, updateMe, changePassword };
