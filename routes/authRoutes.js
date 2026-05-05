const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const { register, login, getMe, updateMe, changePassword } = require("../controllers/authController");

// Avatar upload konfiguratsiyasi
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "avatar_" + req.user._id + "_" + Date.now() + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Faqat rasm yuklash mumkin"));
    }
    cb(null, true);
  },
});

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/me", protect, upload.single("avatar"), updateMe);
router.put("/change-password", protect, changePassword);

module.exports = router;
