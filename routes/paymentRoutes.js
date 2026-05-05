const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createPayment, getMyPayments, getPaymentStatus, getAllPayments,
} = require("../controllers/paymentController");

router.post("/", protect, createPayment);
router.get("/my", protect, getMyPayments);
router.get("/all", protect, adminOnly, getAllPayments);
router.get("/:id/status", protect, getPaymentStatus);

module.exports = router;
