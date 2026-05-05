const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    const enrolledCoursesCount = user.enrolledCourses?.length || 0;

    const enrollments = await Enrollment.find({ user: userId });
    const completedLessonsCount = enrollments.reduce((sum, e) => sum + (e.completedLessons?.length || 0), 0);

    const totalHours = Math.round(completedLessonsCount * 0.5);

    const certificates = enrollments.filter(e => e.completedAt).length;

    res.json([
      { label: "Jami kurslar", value: enrolledCoursesCount.toString(), icon: "📚", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-700/40" },
      { label: "Tugallangan darslar", value: completedLessonsCount.toString(), icon: "✅", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-700/40" },
      { label: "Umumiy soatlar", value: `${totalHours}h`, icon: "⏱", color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-700/40" },
      { label: "Sertifikatlar", value: certificates.toString(), icon: "🏆", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-700/40" },
    ]);
  } catch (error) {
    console.error("Dashboard stats xatosi:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /api/dashboard/courses
const getDashboardCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("enrolledCourses");
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }

    const courses = await Course.find({
      _id: { $in: user.enrolledCourses }
    }).populate("teacher", "name");

    const enrollments = await Enrollment.find({ user: userId });

    const coursesWithProgress = courses.map((course) => {
      const enrollment = enrollments.find(e => e.course.toString() === course._id.toString());
      return {
        id: course._id,
        name: course.title,
        direction: course.category,
        progress: enrollment?.progress || 0,
        teacher: course.teacher?.name || "Ustoz",
        lastLesson: "Dars " + (Math.floor((enrollment?.progress || 0) / 10) + 1)
      };
    });

    res.json(coursesWithProgress);
  } catch (error) {
    console.error("Dashboard courses xatosi:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /api/dashboard/activities
const getActivities = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = [
      { time: "Bugun, 10:30", text: "Dars tugallandi", type: "success" },
      { time: "Kecha, 18:15", text: "Kursga qo'shildingiz", type: "info" },
      { time: "2 kun oldin", text: "Sertifikat olindi", type: "award" },
      { time: "3 kun oldin", text: "Test 85% natijasin bilan yakunlandi", type: "test" },
    ];

    res.json(activities);
  } catch (error) {
    console.error("Dashboard activities xatosi:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { getStats, getDashboardCourses, getActivities };
