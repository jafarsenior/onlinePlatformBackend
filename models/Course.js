const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Kurs nomi majburiy"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Kurs tavsifi majburiy"],
    },
    category: {
      type: String,
      required: [true, "Kategoriya majburiy"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Narx majburiy"],
      min: [0, "Narx manfiy bo'lmasligi kerak"],
    },
    image: {
      type: String,
      default: null,
    },
    videoUrl: {
      type: String,
      default: null,
    },
    topics: {
      type: [String],
      default: [],
    },
    duration: {
      type: String, // masalan: "3 oy", "6 hafta"
      default: null,
    },
    level: {
      type: String,
      enum: ["Boshlang'ich", "O'rta", "Yuqori"],
      default: "Boshlang'ich",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
