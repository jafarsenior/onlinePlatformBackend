const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, teacherOrAdmin } = require("../middleware/authMiddleware");
const {
  getLessons, getLesson, createLesson, updateLesson, deleteLesson, completeLesson,
} = require("../controllers/lessonController");

const MAX_VIDEO_SIZE_MB = Number(process.env.MAX_VIDEO_UPLOAD_MB || 500);
const MAX_VIDEO_SIZE = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// optionalAuth - token bo'lsa tekshiradi, bo'lmasa ham o'tkazadi
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return protect(req, res, next);
  }
  next();
};

const isServerless = Boolean(process.env.VERCEL);
const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        fs.mkdirSync("uploads/videos", { recursive: true });
        cb(null, "uploads/videos/");
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, "lesson_" + Date.now() + ext);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Faqat video fayl yuklash mumkin"));
    }
    cb(null, true);
  },
});

const handleVideoUpload = (req, res, next) => {
  upload.single("video")(req, res, (error) => {
    if (!error) return next();

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: `Video hajmi ${MAX_VIDEO_SIZE_MB} MB dan oshmasin`,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Video yuklashda xatolik",
    });
  });
};

router.get("/", getLessons);
router.get("/:id", optionalAuth, getLesson);
router.post("/", protect, teacherOrAdmin, handleVideoUpload, createLesson);
router.put("/:id", protect, teacherOrAdmin, handleVideoUpload, updateLesson);
router.delete("/:id", protect, teacherOrAdmin, deleteLesson);
router.post("/:id/complete", protect, completeLesson);

module.exports = router;
