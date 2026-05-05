const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism majburiy"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon majburiy"],
    },
    email: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      required: [true, "Xabar majburiy"],
    },
    course: {
      type: String, // qaysi kurs haqida so'rayapti
      default: null,
    },
    status: {
      type: String,
      enum: ["new", "viewed", "replied"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
