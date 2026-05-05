const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    lessonNumber: {
      type: Number,
      required: [true, "Dars raqami majburiy"],
    },
    title: {
      type: String,
      required: [true, "Dars nomi majburiy"],
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: String, // masalan: "45 daqiqa"
      default: null,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Kurs majburiy"],
    },
    resources: [
      {
        name: String,
        url: String,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indeks: guruh + dars raqami bo'yicha tezroq qidirish
lessonSchema.index({ group: 1, lessonNumber: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);
