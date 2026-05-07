require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    const [, , name, phone, password] = process.argv;

    if (!name || !phone || !password) {
      console.error("Ishlatish: npm run create-admin -- \"Admin Name\" +998901234567 parol123");
      process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI topilmadi. Backend .env yoki Vercel env sozlamasini tekshiring.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingUser = await User.findOne({ phone }).select("+password");

    if (existingUser) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.role = "admin";
      existingUser.isActive = true;
      await existingUser.save();

      console.log(`Admin yangilandi: ${phone}`);
    } else {
      await User.create({
        name,
        phone,
        password,
        role: "admin",
        isActive: true,
      });

      console.log(`Admin yaratildi: ${phone}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Admin yaratishda xato:", error.message);
    process.exit(1);
  }
};

createAdmin();
