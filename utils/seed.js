/**
 * Seed script - bazaga test ma'lumotlari kiritish
 * Ishlatish: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Course = require("../models/Course");
const Group = require("../models/Group");
const Lesson = require("../models/Lesson");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB ga ulandi");

    // Eski ma'lumotlarni tozalash
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Group.deleteMany({}),
      Lesson.deleteMany({}),
    ]);
    console.log("🗑️  Eski ma'lumotlar o'chirildi");

    // ── Foydalanuvchilar ──────────────────────────────────────
    const adminUser = await User.create({
      name: "Admin",
      phone: "+998901234567",
      password: "admin123",
      role: "admin",
    });

    const teacherUser = await User.create({
      name: "Jabborov Jafar",
      phone: "+998901234568",
      password: "teacher123",
      role: "teacher",
    });

    const studentUser = await User.create({
      name: "Test Student",
      phone: "+998901234569",
      password: "student123",
      role: "user",
    });

    console.log("👤 Foydalanuvchilar yaratildi");

    // ── Kurslar ───────────────────────────────────────────────
    const frontendCourse = await Course.create({
      title: "Frontend ReactJS",
      description: "HTML, CSS, JavaScript va ReactJS bo'yicha to'liq kurs",
      category: "Frontend",
      price: 99,
      topics: ["HTML5, CSS3", "JavaScript ES6+", "ReactJS", "Tailwind CSS", "Git & GitHub"],
      duration: "4 oy",
      level: "Boshlang'ich",
      teacher: teacherUser._id,
      videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
      studentsCount: 120,
    });

    const backendCourse = await Course.create({
      title: "Backend Node.js",
      description: "Node.js, Express va MongoDB bilan backend dasturlash",
      category: "Backend",
      price: 129,
      topics: ["Node.js", "Express.js", "MongoDB", "REST API", "JWT Auth"],
      duration: "3 oy",
      level: "O'rta",
      teacher: teacherUser._id,
      studentsCount: 85,
    });

    const fullstackCourse = await Course.create({
      title: "Full Stack Web Dasturlash",
      description: "Frontend va Backend bo'yicha chuqur bilimlar",
      category: "Full Stack",
      price: 199,
      topics: ["HTML/CSS/JS", "ReactJS", "Node.js", "MongoDB", "Deployment"],
      duration: "6 oy",
      level: "O'rta",
      teacher: teacherUser._id,
      studentsCount: 60,
    });

    console.log("📚 Kurslar yaratildi");

    // ── Guruhlar ──────────────────────────────────────────────
    const group1 = await Group.create({
      name: "Frontend ReactJS (Standard) N50",
      course: frontendCourse._id,
      teacher: teacherUser._id,
      direction: "Dasturlash",
      startDate: new Date("2024-09-29"),
      schedule: "Dushanba, Chorshanba, Juma - 18:00",
      maxStudents: 30,
    });

    const group2 = await Group.create({
      name: "Frontend ReactJS (Standard) N51",
      course: frontendCourse._id,
      teacher: teacherUser._id,
      direction: "Dasturlash",
      startDate: new Date("2024-10-15"),
      schedule: "Seshanba, Payshanba - 10:00",
      maxStudents: 25,
    });

    const group3 = await Group.create({
      name: "Backend Node.js N12",
      course: backendCourse._id,
      teacher: teacherUser._id,
      direction: "Dasturlash",
      startDate: new Date("2024-11-01"),
      schedule: "Dushanba - Juma 14:00",
      maxStudents: 20,
    });

    console.log("👥 Guruhlar yaratildi");

    // ── Darslar ───────────────────────────────────────────────
    const lessonsData = [];
    for (let i = 1; i <= 10; i++) {
      lessonsData.push({
        lessonNumber: i,
        title: `Dars ${i} - ${["HTML asoslari", "CSS Flexbox", "CSS Grid", "JavaScript kirish", "JS Funksiyalar", "JS Array metodlari", "DOM manipulyatsiya", "Events", "Async/Await", "Fetch API"][i - 1]}`,
        content: `${i}-dars mavzusi bo'yicha tushuntirish`,
        description: `Ushbu darsda ${i}-mavzu batafsil o'rganiladi`,
        videoUrl: `https://www.youtube.com/embed/dummy_video_${i}`,
        duration: `${40 + i} daqiqa`,
        group: group1._id,
        course: frontendCourse._id,
      });
    }

    await Lesson.insertMany(lessonsData);
    console.log("🎓 Darslar yaratildi");

    console.log("\n✅ Seed muvaffaqiyatli yakunlandi!\n");
    console.log("═══════════════════════════════════════");
    console.log("  Admin:   +998901234567 / admin123");
    console.log("  Teacher: +998901234568 / teacher123");
    console.log("  Student: +998901234569 / student123");
    console.log("═══════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed xatosi:", error.message);
    process.exit(1);
  }
};

seed();
