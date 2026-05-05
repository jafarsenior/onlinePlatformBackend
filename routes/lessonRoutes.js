const express = require("express");
const router = express.Router();
const { protect, teacherOrAdmin } = require("../middleware/authMiddleware");
const {
  getLessons, getLesson, createLesson, updateLesson, deleteLesson, completeLesson,
} = require("../controllers/lessonController");

// optionalAuth - token bo'lsa tekshiradi, bo'lmasa ham o'tkazadi
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return protect(req, res, next);
  }
  next();
};

router.get("/", getLessons);
router.get("/:id", optionalAuth, getLesson);
router.post("/", protect, teacherOrAdmin, createLesson);
router.put("/:id", protect, teacherOrAdmin, updateLesson);
router.delete("/:id", protect, teacherOrAdmin, deleteLesson);
router.post("/:id/complete", protect, completeLesson);

module.exports = router;
