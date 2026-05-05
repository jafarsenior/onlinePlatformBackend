const Enrollment = require("../models/Enrollment");

// ─── GET /api/enrollments/my ──────────────────────────────────
const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user._id,
      isActive: true,
    })
      .populate("course", "title category image price duration level")
      .populate("group", "name schedule teacherName")
      .sort({ enrolledAt: -1 });

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/enrollments/my/:courseId ───────────────────────
const getMyCourseDetail = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    })
      .populate("course")
      .populate("completedLessons");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Siz bu kursga yozilmagansiz",
      });
    }
    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/enrollments  (admin) ───────────────────────────
const getAllEnrollments = async (req, res) => {
  try {
    const { courseId, userId } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (userId) filter.user = userId;

    const enrollments = await Enrollment.find(filter)
      .populate("user", "name phone")
      .populate("course", "title")
      .sort({ enrolledAt: -1 });

    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { getMyCourses, getMyCourseDetail, getAllEnrollments };
