const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ism majburiy"],
      trim: true,
      minlength: [2, "Ism kamida 2 ta harf bo'lishi kerak"],
    },
    phone: {
      type: String,
      required: [true, "Telefon raqam majburiy"],
      unique: true,
      match: [/^\+998[0-9]{9}$/, "Telefon raqam noto'g'ri formatda (+998XXXXXXXXX)"],
    },
    password: {
      type: String,
      required: [true, "Parol majburiy"],
      minlength: [6, "Parol kamida 6 ta belgi bo'lishi kerak"],
      select: false, // default so'rovlarda parol qaytmaydi
    },
    role: {
      type: String,
      enum: ["student", "user", "teacher", "admin"],
      default: "student",
    },
    avatar: {
      type: String,
      default: null,
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Parolni saqlashdan oldin hash qilish
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Parolni tekshirish metodi
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Javobdan parolni olib tashlash
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
