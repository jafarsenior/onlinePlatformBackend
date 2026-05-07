const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, teacherOrAdmin } = require("../middleware/authMiddleware");
const {
  getCourses, getCourse, getTeacherCourses, getCategories, createCourse, updateCourse, deleteCourse,
} = require("../controllers/courseController");

const isServerless = Boolean(process.env.VERCEL);
const storage = isServerless
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        fs.mkdirSync("uploads", { recursive: true });
        cb(null, "uploads/");
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, "course_" + Date.now() + ext);
      },
    });
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public
router.get("/", getCourses);
router.get("/categories", getCategories);
router.get("/teacher/my", protect, teacherOrAdmin, getTeacherCourses);
router.get("/:id", getCourse);

// Teacher/Admin
router.post("/", protect, teacherOrAdmin, upload.single("image"), createCourse);
router.put("/:id", protect, teacherOrAdmin, upload.single("image"), updateCourse);
router.delete("/:id", protect, teacherOrAdmin, deleteCourse);

module.exports = router;
