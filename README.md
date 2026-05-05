# 🚀 Online Platforma - Backend API

Node.js + Express + MongoDB bilan yozilgan REST API.

## O'rnatish

```bash
# 1. Papkaga o'tish
cd backend

# 2. Kutubxonalarni o'rnatish
npm install

# 3. .env fayl yaratish
cp .env.example .env
# .env faylni tahrirlang va MongoDB URI ni kiriting

# 4. uploads papkasini yaratish
mkdir uploads

# 5. Test ma'lumotlarini kiritish (ixtiyoriy)
npm run seed

# 6. Serverni ishga tushirish
npm run dev     # development
npm start       # production
```

## Talablar
- Node.js v18+
- MongoDB (local yoki MongoDB Atlas)

---

## 📋 API Endpointlar

### 🔐 Auth — `/api/auth`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| POST | `/api/auth/register` | Ro'yxatdan o'tish | — |
| POST | `/api/auth/login` | Kirish | — |
| GET | `/api/auth/me` | Mening profilim | ✅ |
| PUT | `/api/auth/me` | Profilni tahrirlash | ✅ |
| PUT | `/api/auth/change-password` | Parol o'zgartirish | ✅ |

**Register so'rovi:**
```json
POST /api/auth/register
{
  "name": "Ali Valiyev",
  "phone": "+998901234567",
  "password": "parol123"
}
```

**Login so'rovi:**
```json
POST /api/auth/login
{
  "phone": "+998901234567",
  "password": "parol123"
}
```

**Login javobi:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": { "id": "...", "name": "Ali", "phone": "+998...", "role": "user" }
}
```

---

### 📚 Kurslar — `/api/courses`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/courses` | Barcha kurslar | — |
| GET | `/api/courses?category=Frontend` | Kategoriya filter | — |
| GET | `/api/courses?search=react` | Qidirish | — |
| GET | `/api/courses/:id` | Bitta kurs | — |
| POST | `/api/courses` | Kurs yaratish | Admin |
| PUT | `/api/courses/:id` | Kursni tahrirlash | Admin |
| DELETE | `/api/courses/:id` | Kursni o'chirish | Admin |

---

### 👥 Guruhlar — `/api/groups`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/groups` | Barcha guruhlar | — |
| GET | `/api/groups?courseId=...` | Kurs bo'yicha guruhlar | — |
| GET | `/api/groups/:id` | Bitta guruh | — |
| POST | `/api/groups` | Guruh yaratish | Admin |
| PUT | `/api/groups/:id` | Guruhni tahrirlash | Admin |
| DELETE | `/api/groups/:id` | Guruhni o'chirish | Admin |

---

### 🎓 Darslar — `/api/lessons`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/lessons?groupId=...` | Guruh darslar | — |
| GET | `/api/lessons/:id` | Bitta dars (kursga yozilgan bo'lsa) | ✅ |
| POST | `/api/lessons` | Dars yaratish | Teacher/Admin |
| PUT | `/api/lessons/:id` | Darsni tahrirlash | Teacher/Admin |
| DELETE | `/api/lessons/:id` | Darsni o'chirish | Teacher/Admin |
| POST | `/api/lessons/:id/complete` | Darsni tugallash | ✅ |

---

### 💳 To'lovlar — `/api/payments`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| POST | `/api/payments` | To'lov qilish | ✅ |
| GET | `/api/payments/my` | Mening to'lovlarim | ✅ |
| GET | `/api/payments/:id/status` | To'lov holati | ✅ |
| GET | `/api/payments/all` | Barcha to'lovlar | Admin |

**To'lov so'rovi:**
```json
POST /api/payments
Authorization: Bearer <token>
{
  "courseId": "...",
  "cardNumber": "8600 1234 5678 9012",
  "cardHolder": "ALI VALIYEV",
  "paymentMethod": "card"
}
```

---

### 📖 Mening kurslarim — `/api/enrollments`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/enrollments/my` | Sotib olingan kurslar | ✅ |
| GET | `/api/enrollments/my/:courseId` | Kurs tafsiloti + progress | ✅ |
| GET | `/api/enrollments/all` | Barcha enrollmentlar | Admin |

---

### 📬 Murojaat — `/api/contact`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| POST | `/api/contact` | Murojaat yuborish | — |
| GET | `/api/contact` | Barcha murojaatlar | Admin |
| PUT | `/api/contact/:id` | Status o'zgartirish | Admin |

---

### 📊 Admin — `/api/admin`

| Method | URL | Tavsif | Auth |
|--------|-----|--------|------|
| GET | `/api/admin/stats` | Statistika dashboard | Admin |
| GET | `/api/admin/users` | Barcha foydalanuvchilar | Admin |
| PUT | `/api/admin/users/:id` | Foydalanuvchini tahrirlash | Admin |

---

## 🔑 Token ishlatish

Himoyalangan so'rovlarda header qo'shing:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## Frontendda integratsiya misoli

```javascript
// Login
const res = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone: "+998901234567", password: "parol123" })
});
const data = await res.json();
localStorage.setItem("token", data.token);

// Himoyalangan so'rov
const token = localStorage.getItem("token");
const courses = await fetch("http://localhost:5000/api/enrollments/my", {
  headers: { Authorization: `Bearer ${token}` }
});
```
