const Test = require("../models/Test");

// GET /api/tests
const getTests = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;

    const tests = await Test.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      tests
    });
  } catch (error) {
    console.error("Tests xatosi:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /api/tests/:id
const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test topilmadi" });
    }
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// POST /api/tests (admin)
const createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json({ success: true, message: "Test yaratildi", test });
  } catch (error) {
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message)[0];
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// PUT /api/tests/:id (admin)
const updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!test) {
      return res.status(404).json({ success: false, message: "Test topilmadi" });
    }

    res.json({ success: true, message: "Test yangilandi", test });
  } catch (error) {
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors).map((e) => e.message)[0];
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// DELETE /api/tests/:id (admin)
const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ success: false, message: "Test topilmadi" });
    }

    res.json({ success: true, message: "Test o'chirildi" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { getTests, getTest, createTest, updateTest, deleteTest };
