# OTP Setup Guide - Nite Mailer with Gmail

## Overview
Full OTP-based forgot password flow has been implemented using Nodemailer for sending OTPs via Gmail.

---

## Backend Setup

### 1. OTP Model (`server/models/OTP.js`)
- Stores temporary OTP codes with email
- Auto-deletes after 10 minutes using MongoDB TTL index
- Schema: `{ email, otp, createdAt }`

### 2. API Endpoints (Updated in `server/Routes/authRoutes.js`)

#### POST `/api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent to your email successfully.",
  "email": "user@example.com"
}
```

**Process:**
1. Validates email exists in User/Company/Admin models
2. Generates 6-digit OTP
3. Deletes any previous OTP for that email
4. Saves new OTP to database
5. Sends beautiful HTML email with OTP

#### POST `/api/auth/verify-otp`
**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "email": "user@example.com"
}
```

**Process:**
1. Finds OTP in database for given email
2. Validates OTP matches
3. Deletes OTP after verification
4. Returns success to proceed to password reset

#### POST `/api/auth/reset-password`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "NewPassword123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User password updated successfully!"
}
```

---

## Frontend Setup

### Components Updated

#### 1. `ForgetPassword.tsx`
- Email input form
- Sends OTP request
- Redirects to verify-otp page on success

#### 2. `VerifyOtp.tsx`
- 6-digit OTP input
- Validates OTP with backend
- Redirects to reset-password on success

#### 3. `ResetPassword.tsx`
- Password strength validation
- Confirm password matching
- Sends new password to backend
- Redirects to login on success

#### 4. `App.tsx` Routes
```tsx
<Route path="/forgot-password" element={<ForgetPassword/>}/>
<Route path="/verify-otp" element={<VerifyOtp/>}/>
<Route path="/reset-password" element={<ResetPassword/>} />
```

---

## Email Configuration (Nodemailer)

### Gmail Setup Steps

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to https://myaccount.google.com/security

2. **Generate App Password**
   - In Security settings, find "App passwords"
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password

3. **Update `.env` file** in `server/` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finaljob_edu
CLIENT_URL=http://localhost:8080
JWT_SECRET=23c1674ca310f5ddf32b4c1705144e5aa695e151436b72ecac00d94997e779746480cad6332b6182
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

4. **Test Email Sending**
   - Start backend server: `npm run dev` (from server folder)
   - Try forgot-password flow
   - OTP email should arrive in inbox

### Email Template
The email is professionally formatted with:
- Company branding
- Clear 6-digit OTP display
- 10-minute expiration warning
- Professional footer

---

## Flow Diagram

```
User → Forgot Password Page
         ↓ (enters email)
    Backend: Generate OTP, Send Email
         ↓
    User → Verify OTP Page
         ↓ (enters OTP)
    Backend: Validate OTP
         ↓
    User → Reset Password Page
         ↓ (enters new password)
    Backend: Update Password
         ↓
    User → Login with new password ✅
```

---

## Environment Variables

**File:** `server/.env`

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com          # Your Gmail address
EMAIL_PASS=xxxx xxxx xxxx xxxx           # 16-character App Password
```

### To Get App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other (custom name)"
3. Type: "Job Portal"
4. Copy the generated 16-character password

---

## Testing the OTP Flow

### Steps:
1. Navigate to `/forgot-password`
2. Enter a registered email address
3. Click "Send OTP"
4. Check email inbox for OTP
5. Enter OTP on verification page
6. Create new strong password
7. Login with new credentials

### Test Credentials (if available):
- Email: `tech@gmail.com` (existing company account)
- New Password: `TestPassword123!` (example)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "OTP sent but email not received" | Check Email_USER and EMAIL_PASS in .env |
| "Invalid app password" | Regenerate app password from Gmail security page |
| "Connection error when sending email" | Ensure 2FA is enabled and app password is correct |
| "OTP expired" | OTP valid for 10 minutes, request new one |
| "Email not found" | User must be registered first |

---

## Database Indexes

The OTP collection uses MongoDB TTL index to auto-delete expired OTPs after 10 minutes:
```javascript
db.otps.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 600 })
```

This is automatically handled by Mongoose schema configuration.

---

## Security Notes

✅ OTPs are 6 digits (1 million combinations)  
✅ OTPs expire after 10 minutes  
✅ OTP deleted after successful verification  
✅ Passwords hashed with bcrypt (10 rounds)  
✅ Password strength validation enforced  
✅ Email validation before OTP generation  

---

## Next Steps (Optional Enhancements)

- [ ] Add OTP resend functionality (rate-limited)
- [ ] Add email verification for new signups
- [ ] Implement phone SMS OTP as alternative
- [ ] Add account lockout after failed attempts
- [ ] Track password change history
