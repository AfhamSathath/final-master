# Quick Setup Checklist - OTP Implementation

## ✅ Completed Backend Tasks

- [x] Created `server/models/OTP.js` - MongoDB OTP schema with 10-minute auto-expiration
- [x] Updated `server/Routes/authRoutes.js` with:
  - [x] Nodemailer transporter configuration
  - [x] POST `/api/auth/forgot-password` - Generate & send OTP
  - [x] POST `/api/auth/verify-otp` - Validate OTP code
  - [x] POST `/api/auth/reset-password` - Update password
- [x] Email template with professional HTML formatting
- [x] Lowercase email normalization across all endpoints

## ✅ Completed Frontend Tasks

- [x] `clientnew/src/pages/auth/ForgetPassword.tsx` - Already configured
- [x] `clientnew/src/pages/auth/VerifyOtp.tsx` - Already configured
- [x] `clientnew/src/pages/auth/ResetPassword.tsx` - Already configured
- [x] Added routes to `clientnew/src/App.tsx`:
  - [x] `/forgot-password`
  - [x] `/verify-otp`
  - [x] `/reset-password`
- [x] Environment variable `VITE_API_URL` in `clientnew/.env`

## ⚙️ Configuration Required

### 1. Server Email Setup (REQUIRED)

Edit `server/.env` and add:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**Steps to get Gmail App Password:**
1. Enable 2FA on Gmail account (https://myaccount.google.com/security)
2. Generate App Password (https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password to `.env`

### 2. Start Backend Server
```bash
cd server
npm install  # If needed
npm run dev
```

### 3. Start Frontend Dev Server
```bash
cd clientnew
npm run dev
```

### 4. Test the Flow
- Navigate to `/forgot-password`
- Enter registered email
- Check email for OTP
- Complete reset password flow

## 📋 Files Modified

### Backend
- `server/models/OTP.js` - NEW
- `server/Routes/authRoutes.js` - UPDATED
- `server/.env` - NEEDS UPDATE

### Frontend
- `clientnew/src/App.tsx` - UPDATED (added VerifyOtp import and route)
- `clientnew/src/pages/auth/ForgetPassword.tsx` - Already complete
- `clientnew/src/pages/auth/VerifyOtp.tsx` - Already complete
- `clientnew/src/pages/auth/ResetPassword.tsx` - Already complete
- `clientnew/.env` - Already has VITE_API_URL

## 🧪 Testing Commands

```bash
# Test forgot-password endpoint
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test verify-otp endpoint (replace OTP with actual code)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# Test reset-password endpoint
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"NewPass123!"}'
```

## 🔒 Security Features

- ✅ 6-digit OTP generation
- ✅ 10-minute expiration (auto-delete from DB)
- ✅ OTP deleted after verification (one-time use)
- ✅ Email validation before OTP sent
- ✅ Password strength enforcement:
  - Min 8 characters
  - Uppercase letter required
  - Lowercase letter required
  - Number required
  - Special character required (@$!%*?&)
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Lowercase email normalization
- ✅ Case-insensitive email lookups

## 📞 Support

Refer to `OTP_SETUP_GUIDE.md` for detailed information on:
- Email configuration steps
- API endpoint documentation
- Troubleshooting guide
- Flow diagrams
- Security notes

---

**Status:** ✅ READY TO USE - Only email configuration needed!
