const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getMyCourses, getMyCourseDetail, getAllEnrollments } = require("../controllers/enrollmentController");

router.get("/my", protect, getMyCourses);
router.get("/my/:courseId", protect, getMyCourseDetail);
router.get("/all", protect, adminOnly, getAllEnrollments);

module.exports = router;
