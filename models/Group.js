const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Guruh nomi majburiy"],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Kurs majburiy"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "O'qituvchi majburiy"],
    },
    direction: {
      type: String,
      required: [true, "Yo'nalish majburiy"],
    },
    startDate: {
      type: Date,
      required: [true, "Boshlanish sanasi majburiy"],
    },
    endDate: {
      type: Date,
      default: null,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxStudents: {
      type: Number,
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    schedule: {
      type: String, // masalan: "Dushanba, Chorshanba, Juma - 18:00"
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
