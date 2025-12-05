# Register Component - Quick Start Guide

## What Was Updated

Your Register.tsx component now fully integrates with **Nodemailer** for email verification during registration.

## How It Works

### 3-Step Registration Process

```
1. User fills form + clicks Register
   ↓
2. Backend sends OTP via email (Nodemailer)
   ↓
3. User enters OTP → Backend verifies → Account created
```

## Key Changes

### Frontend (Register.tsx)

| Function | What It Does |
|----------|-------------|
| `sendOtp()` | Calls `/api/auth/register-send-otp` to send OTP email |
| `resendOtp()` | Allows user to request OTP again |
| `verifyOtpAndRegister()` | Calls `/api/auth/register-verify-otp` then creates account |

### Backend (authRoutes.js)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/register-send-otp` | Generate & send OTP email |
| `POST /api/auth/register-verify-otp` | Verify OTP matches |

## Testing

```bash
# Terminal 1 - Start Backend
cd server
npm start

# Terminal 2 - Start Frontend  
cd clientnew
npm run dev

# Then open: http://localhost:8080/register
```

## During Testing

1. Fill registration form
2. Click "Register"
3. Check **server terminal** for OTP output:
   ```
   📧 EMAIL WOULD BE SENT:
      To: user@email.com
      🔑 OTP: 123456
   ```
4. Copy OTP and enter on frontend
5. Click "Verify & Register"

## Features

✅ Email validation  
✅ OTP sent via Nodemailer  
✅ 6-digit random OTP  
✅ 10-minute expiration  
✅ One-time use (auto-deleted)  
✅ Resend OTP option  
✅ Beautiful HTML email template  
✅ Professional error messages  
✅ Company verification option  

## Current Mode

**Dev Mode (Console Logging)**
- OTPs print to server console instead of actual emails
- Perfect for testing
- To use real Gmail: Update `transporter` config in authRoutes.js

## Error Messages

| Message | Reason | Fix |
|---------|--------|-----|
| "Email is already registered" | Account exists | Use different email |
| "OTP not found or has expired" | OTP expired (10 min) | Click Resend OTP |
| "Invalid OTP" | Wrong OTP entered | Check server console |

## Files Changed

- `clientnew/src/pages/Register.tsx` - Frontend component
- `server/Routes/authRoutes.js` - Backend endpoints

## What's Next

- Test the complete registration flow
- (Optional) Set up real Gmail SMTP
- Monitor server console for OTP logs
