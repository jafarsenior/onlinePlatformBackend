const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Savol majburiy"],
    },
    category: {
      type: String,
      required: [true, "Kategoriya majburiy"],
      enum: ["html", "js", "react", "css", "node", "other"],
    },
    options: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],
    explanation: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["oson", "ortacha", "qiyin"],
      default: "ortacha",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);
