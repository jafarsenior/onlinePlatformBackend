const Course = require("../models/Course");

const parseTopics = (topics) => {
  if (!topics) return [];
  if (Array.isArray(topics)) return topics;
  try {
    const parsed = JSON.parse(topics);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return String(topics)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const uploadedImage = (file) => {
  if (!file) return null;
  if (file.filename) return `/uploads/${file.filename}`;
  if (file.buffer && file.mimetype?.startsWith("image/")) {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  }
  return null;
};

// ─── GET /api/courses ─────────────────────────────────────────
const getCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (category && category !== "Barcha kasblar") {
      filter.category = category;
    }
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate("teacher", "name")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/courses/:id ─────────────────────────────────────
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "teacher",
      "name phone"
    );
    if (!course) {
      return res.status(404).json({ success: false, message: "Kurs topilmadi" });
    }
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

const getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      teacher: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Course.distinct("category", { isActive: true });
    res.json({
      success: true,
      categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── POST /api/courses  (admin) ───────────────────────────────
const createCourse = async (req, res) => {
  try {
    const { title, description, category, price, topics, duration, level, videoUrl, teacher } = req.body;
    const image = uploadedImage(req.file);
    const owner = req.user.role === "teacher" ? req.user._id : teacher || null;

    const course = await Course.create({
      title, description, category, price,
      topics: parseTopics(topics),
      duration, level, videoUrl, teacher: owner, image,
    });

    res.status(201).json({ success: true, message: "Kurs yaratildi", course });
  } catch (error) {
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message)[0];
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message || "Server xatosi" });
  }
};

// ─── PUT /api/courses/:id  (admin) ───────────────────────────
const updateCourse = async (req, res) => {
  try {
    const existing = await Course.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Kurs topilmadi" });
    }
    if (req.user.role === "teacher" && String(existing.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Faqat o'zingiz yaratgan kursni tahrirlaysiz" });
    }

    const updateData = { ...req.body };
    if (req.body.topics) updateData.topics = parseTopics(req.body.topics);
    const image = uploadedImage(req.file);
    if (image) updateData.image = image;
    if (req.user.role === "teacher") delete updateData.teacher;

    const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Kurs topilmadi" });
    }
    res.json({ success: true, message: "Kurs yangilandi", course });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── DELETE /api/courses/:id  (admin) ────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const existing = await Course.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Kurs topilmadi" });
    }
    if (req.user.role === "teacher" && String(existing.teacher) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Faqat o'zingiz yaratgan kursni o'chirasiz" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ success: false, message: "Kurs topilmadi" });
    }
    res.json({ success: true, message: "Kurs o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { getCourses, getCourse, getTeacherCourses, getCategories, createCourse, updateCourse, deleteCourse };
