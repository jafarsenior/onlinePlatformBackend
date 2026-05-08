const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
require("../models/Group");

const uploadedVideo = (file) => {
  if (!file) return null;
  if (file.filename) return `/uploads/videos/${file.filename}`;
  if (file.buffer && file.mimetype?.startsWith("video/")) {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  }
  return null;
};

const parseResources = (resources) => {
  if (!resources) return [];
  if (Array.isArray(resources)) return resources;
  try {
    const parsed = JSON.parse(resources);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
};

// ─── GET /api/lessons  (query: groupId, courseId) ─────────────
const getLessons = async (req, res) => {
  try {
    const { groupId, courseId } = req.query;
    const filter = { isPublished: true };
    if (groupId) filter.group = groupId;
    if (courseId) filter.course = courseId;

    const lessons = await Lesson.find(filter)
      .populate("group", "name")
      .sort({ lessonNumber: 1 });

    res.json({ success: true, lessons });
  } catch (error) {
    console.error("Lessons list xatosi:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/lessons/:id ─────────────────────────────────────
const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate("group", "name")
      .populate("course", "title");

    if (!lesson) {
      return res.status(404).json({ success: false, message: "Dars topilmadi" });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Darsni ko'rish uchun tizimga kiring",
      });
    }

    // Foydalanuvchi bu kursga yozilganmi tekshirish
    if (["student", "user"].includes(req.user.role)) {
      const enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: lesson.course._id,
        isActive: true,
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "Bu darsni ko'rish uchun kursni sotib oling",
        });
      }
    }

    res.json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── POST /api/lessons  (teacher/admin) ───────────────────────
const createLesson = async (req, res) => {
  try {
    const { lessonNumber, title, content, description, videoUrl, duration, group, course, resources } = req.body;
    const video = uploadedVideo(req.file);

    if (req.user.role === "teacher") {
      const ownedCourse = await Course.findOne({ _id: course, teacher: req.user._id });
      if (!ownedCourse) {
        return res.status(403).json({ success: false, message: "Faqat o'zingizning kursingizga dars qo'shasiz" });
      }
    }

    const lesson = await Lesson.create({
      lessonNumber, title, content, description,
      videoUrl: video || videoUrl,
      duration, group: group || null, course,
      resources: parseResources(resources),
    });

    res.status(201).json({ success: true, message: "Dars yaratildi", lesson });
  } catch (error) {
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message)[0];
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message || "Server xatosi" });
  }
};

// ─── PUT /api/lessons/:id  (teacher/admin) ────────────────────
const updateLesson = async (req, res) => {
  try {
    const existing = await Lesson.findById(req.params.id).populate("course", "teacher");
    if (!existing) {
      return res.status(404).json({ success: false, message: "Dars topilmadi" });
    }
    if (req.user.role === "teacher" && String(existing.course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Faqat o'zingizning darsingizni tahrirlaysiz" });
    }

    const updateData = { ...req.body };
    if (req.body.resources) updateData.resources = parseResources(req.body.resources);
    const video = uploadedVideo(req.file);
    if (video) updateData.videoUrl = video;
    if (!updateData.group) updateData.group = null;

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Dars yangilandi", lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server xatosi" });
  }
};

// ─── DELETE /api/lessons/:id  (admin) ────────────────────────
const deleteLesson = async (req, res) => {
  try {
    const existing = await Lesson.findById(req.params.id).populate("course", "teacher");
    if (!existing) {
      return res.status(404).json({ success: false, message: "Dars topilmadi" });
    }
    if (req.user.role === "teacher" && String(existing.course.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Faqat o'zingizning darsingizni o'chirasiz" });
    }

    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Dars topilmadi" });
    }
    res.json({ success: true, message: "Dars o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── POST /api/lessons/:id/complete  (user) ───────────────────
const completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: "Dars topilmadi" });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: lesson.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "Siz bu kursda ro'yxatda emassiz",
      });
    }

    if (!enrollment.completedLessons.includes(lesson._id)) {
      enrollment.completedLessons.push(lesson._id);

      // Progress hisoblash
      const totalLessons = await Lesson.countDocuments({ course: lesson.course });
      enrollment.progress = Math.round(
        (enrollment.completedLessons.length / totalLessons) * 100
      );

      if (enrollment.progress === 100) {
        enrollment.completedAt = new Date();
      }

      await enrollment.save();
    }

    res.json({
      success: true,
      message: "Dars tugallandi",
      progress: enrollment.progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { getLessons, getLesson, createLesson, updateLesson, deleteLesson, completeLesson };
