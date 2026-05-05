const Contact = require("../models/Contact");

// ─── POST /api/contact ────────────────────────────────────────
const sendContact = async (req, res) => {
  try {
    const { name, phone, email, message, course } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Ism, telefon va xabar majburiy",
      });
    }

    const contact = await Contact.create({ name, phone, email, message, course });

    // Telegram ga yuborish (ixtiyoriy)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const text = `📩 Yangi murojaat!\n\n👤 Ism: ${name}\n📞 Telefon: ${phone}\n📧 Email: ${email || "—"}\n📚 Kurs: ${course || "—"}\n💬 Xabar: ${message}`;
        const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text,
          }),
        });
      } catch (tgErr) {
        console.error("Telegram xato:", tgErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Murojaatingiz qabul qilindi! Tez orada siz bilan bog'lanamiz.",
      contact: { id: contact._id },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── GET /api/contact  (admin) ────────────────────────────────
const getContacts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ success: true, total, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// ─── PUT /api/contact/:id  (admin) ───────────────────────────
const updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: "Murojaat topilmadi" });
    }
    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

module.exports = { sendContact, getContacts, updateContactStatus };
