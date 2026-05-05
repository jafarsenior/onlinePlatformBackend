const Payment = require("../models/Payment");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

// ─── POST /api/payments ───────────────────────────────────────
const createPayment = async (req, res) => {
  try {
    const { courseId, cardNumber, cardHolder, paymentMethod = "card" } = req.body;

    if (!courseId || !cardNumber || !cardHolder) {
      return res.status(400).json({
        success: false,
        message: "Kurs, karta raqami va karta egasi ismi majburiy",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Kurs topilmadi" });
    }

    // Allaqachon sotib olinganmi tekshirish
    const existing = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Siz bu kursni allaqachon sotib olgansiz",
      });
    }

    // Faqat oxirgi 4 raqamni saqlash (xavfsizlik)
    const maskedCard = "**** **** **** " + cardNumber.replace(/\s/g, "").slice(-4);

    // To'lovni yaratish (haqiqiy to'lov tizimida bu yerda bank API chaqiriladi)
    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      amount: course.price,
      cardNumber: maskedCard,
      cardHolder,
      paymentMethod,
      status: "success", // Test rejimida avtomatik success
      transactionId: "TXN_" + Date.now(),
      paidAt: new Date(),
    });

    // Enrollment yaratish
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      payment: payment._id,
    });

    // Foydalanuvchi enrolledCourses ga qo'shish
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: courseId },
    });

    // Kurs studentsCount ni oshirish
    await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });

    res.status(201).json({
      success: true,
      message: "To'lov muvaffaqiyatli amalga oshirildi! Kurs sizga qo'shildi.",
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paidAt: payment.paidAt,
        transactionId: payment.transactionId,
      },
      enrollment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "To'lov amalga oshmadi" });
  }
};

// ─── GET /api/payments/my ─────────────────────────────────────
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("course", "title category image price")
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/payments/:id/status ────────────────────────────
const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("course", "title");

    if (!payment) {
      return res.status(404).json({ success: false, message: "To'lov topilmadi" });
    }

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/payments  (admin only) ─────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate("user", "name phone")
      .populate("course", "title price")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, page: Number(page), payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { createPayment, getMyPayments, getPaymentStatus, getAllPayments };
