const User = require("../models/User");
const Course = require("../models/Course");
const Payment = require("../models/Payment");
const Enrollment = require("../models/Enrollment");
const Contact = require("../models/Contact");
const Group = require("../models/Group");

// ─── GET /api/admin/stats ─────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalPayments,
      totalEnrollments,
      newContacts,
      totalGroups,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ["student", "user"] } }),
      Course.countDocuments({ isActive: true }),
      Payment.countDocuments({ status: "success" }),
      Enrollment.countDocuments({ isActive: true }),
      Contact.countDocuments({ status: "new" }),
      Group.countDocuments({ isActive: true }),
      Payment.find({ status: "success" })
        .populate("user", "name phone")
        .populate("course", "title price")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Jami daromad
    const revenueResult = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalPayments,
        totalEnrollments,
        newContacts,
        totalGroups,
        totalRevenue,
      },
      recentPayments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── PUT /api/admin/users/:id ─────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: "Foydalanuvchi topilmadi" });
    }
    res.json({ success: true, message: "Foydalanuvchi yangilandi", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { getStats, getUsers, updateUser };
