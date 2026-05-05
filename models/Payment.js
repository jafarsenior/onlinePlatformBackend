const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "To'lov summasi majburiy"],
    },
    cardNumber: {
      type: String,
      required: [true, "Karta raqami majburiy"],
      // Faqat oxirgi 4 raqamini saqlaymiz (xavfsizlik uchun)
    },
    cardHolder: {
      type: String,
      required: [true, "Karta egasi ismi majburiy"],
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "payme", "click", "uzum"],
      default: "card",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
