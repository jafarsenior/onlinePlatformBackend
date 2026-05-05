const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, teacherOrAdmin } = require("../middleware/authMiddleware");
const {
  getCourses, getCourse, getTeacherCourses, getCategories, createCourse, updateCourse, deleteCourse,
} = require("../controllers/courseController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
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
