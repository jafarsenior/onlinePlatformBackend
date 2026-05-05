const Group = require("../models/Group");

// ─── GET /api/groups ──────────────────────────────────────────
const getGroups = async (req, res) => {
  try {
    const { courseId, isActive } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const groups = await Group.find(filter)
      .populate("course", "title category")
      .populate("teacher", "name phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/groups/:id ──────────────────────────────────────
const getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("course", "title category price description")
      .populate("teacher", "name phone")
      .populate("students", "name phone");

    if (!group) {
      return res.status(404).json({ success: false, message: "Guruh topilmadi" });
    }
    res.json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── POST /api/groups  (admin) ────────────────────────────────
const createGroup = async (req, res) => {
  try {
    const { name, course, teacher, direction, startDate, endDate, maxStudents, schedule } = req.body;
    const group = await Group.create({
      name, course, teacher, direction, startDate, endDate, maxStudents, schedule,
    });
    const populated = await Group.findById(group._id)
      .populate("course", "title")
      .populate("teacher", "name");

    res.status(201).json({ success: true, message: "Guruh yaratildi", group: populated });
  } catch (error) {
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message)[0];
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── PUT /api/groups/:id  (admin) ────────────────────────────
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("course", "title").populate("teacher", "name");

    if (!group) {
      return res.status(404).json({ success: false, message: "Guruh topilmadi" });
    }
    res.json({ success: true, message: "Guruh yangilandi", group });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── DELETE /api/groups/:id  (admin) ─────────────────────────
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!group) {
      return res.status(404).json({ success: false, message: "Guruh topilmadi" });
    }
    res.json({ success: true, message: "Guruh o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { getGroups, getGroup, createGroup, updateGroup, deleteGroup };
