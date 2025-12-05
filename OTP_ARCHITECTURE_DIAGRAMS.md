# OTP Implementation - Visual Diagrams & Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React/TypeScript)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  ForgetPassword.tsx  │→ │ VerifyOtp.tsx    │→ │ ResetPassword.tsx
│  │  (email input)       │  │ (OTP input)      │  │ (new password)   │
│  └──────────────────────┘  └──────────────────┘  └──────────────┘  │
│           │                        │                      │         │
│           v                        v                      v         │
│      /forgot-password         /verify-otp          /reset-password  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                         HTTP/JSON
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/forgot-password                             │  │
│  │  • Validate email exists                                     │  │
│  │  • Generate 6-digit OTP                                      │  │
│  │  • Save OTP to MongoDB (TTL: 10 min)                         │  │
│  │  • Send email via Nodemailer/Gmail                           │  │
│  │  • Return success                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              v                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/verify-otp                                   │  │
│  │  • Find OTP in database                                      │  │
│  │  • Validate OTP matches                                      │  │
│  │  • Delete OTP (one-time use)                                 │  │
│  │  • Return success                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              v                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/auth/reset-password                               │  │
│  │  • Find account (User/Company/Admin)                         │  │
│  │  • Hash password with bcrypt                                 │  │
│  │  • Update database                                           │  │
│  │  • Return success                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                          Database
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                     MongoDB (Local/Cloud)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  users           │  │  companies       │  │  admins          │ │
│  │  (Users)         │  │  (Companies)     │  │  (Admins)        │ │
│  │  • email         │  │  • email         │  │  • email         │ │
│  │  • password      │  │  • password      │  │  • password      │ │
│  │  • ...           │  │  • ...           │  │  • ...           │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  otps (TTL: 10 minutes)                                      │  │
│  │  • email                                                      │  │
│  │  • otp (6 digits)                                             │  │
│  │  • createdAt (auto-expires)                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                       Email Service
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                    Gmail SMTP (Nodemailer)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  HOST: smtp.gmail.com                                              │
│  PORT: 587 (TLS)                                                   │
│  AUTH: your-email@gmail.com + App Password                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Email Template                                              │  │
│  │  ─────────────────────────────────────────────────────────── │  │
│  │  Subject: Password Reset OTP - Job Portal                    │  │
│  │                                                              │  │
│  │  Hello,                                                     │  │
│  │                                                              │  │
│  │  You requested to reset your password.                       │  │
│  │  Here is your OTP:                                           │  │
│  │                                                              │  │
│  │  ┌────────────┐                                              │  │
│  │  │  123456    │  ← 6-digit code                              │  │
│  │  └────────────┘                                              │  │
│  │                                                              │  │
│  │  ⏱️ Valid for 10 minutes                                     │  │
│  │                                                              │  │
│  │  © 2025 Job Portal                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## OTP Flow Sequence Diagram

```
User                Frontend              Backend              Database        Email
 │                    │                    │                    │               │
 │ 1. Click Forgot    │                    │                    │               │
 │───────────────────>│                    │                    │               │
 │                    │                    │                    │               │
 │ 2. Enter email     │                    │                    │               │
 │───────────────────>│                    │                    │               │
 │                    │ 3. POST            │                    │               │
 │                    │/forgot-password    │                    │               │
 │                    │───────────────────>│ 4. Validate email  │               │
 │                    │                    │───────────────────>│               │
 │                    │                    │<───────────────────│ (found)       │
 │                    │                    │                    │               │
 │                    │                    │ 5. Generate OTP    │               │
 │                    │                    │ (123456)           │               │
 │                    │                    │                    │               │
 │                    │                    │ 6. Save OTP (TTL)  │               │
 │                    │                    │───────────────────>│ (10 min)      │
 │                    │                    │<───────────────────│ (saved)       │
 │                    │                    │                    │               │
 │                    │                    │ 7. Send email      │               │
 │                    │                    │───────────────────────────────────>│
 │                    │                    │                    │               │
 │                    │<───────────────────│ 8. Return success  │               │
 │                    │ (email, success)   │                    │               │
 │ 9. Redirect        │                    │                    │               │
 │<───────────────────│                    │                    │               │
 │ /verify-otp        │                    │                    │               │
 │                    │                    │                    │               │
 │ 10. Check email    │<───────────────────────────────────────────────────────│
 │ OTP: 123456        │ Email delivered    │                    │               │
 │                    │                    │                    │               │
 │ 11. Enter OTP      │                    │                    │               │
 │───────────────────>│                    │                    │               │
 │                    │ 12. POST           │                    │               │
 │                    │/verify-otp         │                    │               │
 │                    │───────────────────>│ 13. Find OTP       │               │
 │                    │                    │───────────────────>│               │
 │                    │                    │<───────────────────│ (found)       │
 │                    │                    │                    │               │
 │                    │                    │ 14. Delete OTP     │               │
 │                    │                    │───────────────────>│               │
 │                    │                    │<───────────────────│ (deleted)     │
 │                    │<───────────────────│ 15. Return success │               │
 │                    │ (email, success)   │                    │               │
 │ 16. Redirect       │                    │                    │               │
 │<───────────────────│                    │                    │               │
 │ /reset-password    │                    │                    │               │
 │                    │                    │                    │               │
 │ 17. Enter new      │                    │                    │               │
 │ password           │                    │                    │               │
 │───────────────────>│                    │                    │               │
 │                    │ 18. POST           │                    │               │
 │                    │/reset-password     │                    │               │
 │                    │───────────────────>│ 19. Find account   │               │
 │                    │                    │───────────────────>│               │
 │                    │                    │<───────────────────│ (found)       │
 │                    │                    │                    │               │
 │                    │                    │ 20. Hash password  │               │
 │                    │                    │ (bcrypt)           │               │
 │                    │                    │                    │               │
 │                    │                    │ 21. Update account │               │
 │                    │                    │───────────────────>│               │
 │                    │                    │<───────────────────│ (updated)     │
 │                    │<───────────────────│ 22. Return success │               │
 │                    │ (success)          │                    │               │
 │ 23. Redirect       │                    │                    │               │
 │<───────────────────│                    │                    │               │
 │ /login             │                    │                    │               │
 │                    │                    │                    │               │
 │ 24. Login with     │                    │                    │               │
 │ new password ✅    │                    │                    │               │
 │───────────────────>│                    │                    │               │
 │                    │                    │                    │               │
```

---

## Data Flow Diagram

```
Input Validation → Email Check → OTP Generation → Database → Email → Success
     ▼              ▼              ▼               ▼         ▼        ▼
  - Required     - Exists in    - 6 digits    - MongoDB  - SMTP    - 200 OK
  - Format        users/company/ - 000000 to   - TTL index - HTML    - Email
                 admin          999999        - 10 min    template  returned

     ↓              ↓              ↓               ↓         ↓        
  Fail→Error    Fail→Not Found  Success→Save   Success→Delete  Fail→Retry
                                              after verify
```

---

## State Transitions

```
                    ┌─────────────────┐
                    │   Start: Login  │
                    └────────┬────────┘
                             │
                    User clicks "Forgot Password"
                             │
                             ▼
                 ┌────────────────────────┐
                 │  Forgot Password Page  │
                 │  • Email input form    │
                 └────────┬───────────────┘
                          │
              User enters email & clicks send
                          │
                          ▼
                 ┌────────────────────────┐
                 │ Backend Processing:    │
                 │ • Validate email       │
                 │ • Generate OTP         │
                 │ • Save to DB (TTL)     │
                 │ • Send email           │
                 └────────┬───────────────┘
                          │
         ┌────────────────┴──────────────────┐
         │                                   │
      SUCCESS                             ERROR
         │                                   │
         ▼                                   ▼
 ┌──────────────────┐          ┌──────────────────────┐
 │ OTP Email Sent   │          │ Error Message        │
 │ Redirect to      │          │ • Email not found    │
 │ Verify OTP Page  │          │ • Server error       │
 └────────┬─────────┘          │ • Try again          │
          │                    └──────────────────────┘
    User gets OTP email (10 min validity)
          │
          ▼
 ┌──────────────────────────┐
 │  Verify OTP Page         │
 │  • OTP input field       │
 │  • Change email option   │
 └────────┬─────────────────┘
          │
   User enters OTP & submits
          │
          ▼
 ┌──────────────────────────┐
 │ Backend Processing:      │
 │ • Find OTP in DB         │
 │ • Match with user input  │
 │ • Delete OTP (one-time)  │
 └────────┬─────────────────┘
          │
    ┌─────┴──────┐
    │            │
 SUCCESS      INVALID/EXPIRED
    │            │
    ▼            ▼
 ┌────────────────────┐   ┌──────────────────┐
 │ Redirect to Reset  │   │ Error: Invalid OTP
 │ Password Page      │   │ Request new OTP  │
 └────────┬───────────┘   └──────────────────┘
          │
 User enters new password
          │
          ▼
 ┌──────────────────────────┐
 │  Reset Password Page     │
 │  • Password validation   │
 │    - Min 8 chars        │
 │    - Upper + lower      │
 │    - Number             │
 │    - Special char       │
 │  • Confirm password     │
 └────────┬─────────────────┘
          │
   User confirms & submits
          │
          ▼
 ┌──────────────────────────┐
 │ Backend Processing:      │
 │ • Find account           │
 │ • Hash password (bcrypt) │
 │ • Update database        │
 └────────┬─────────────────┘
          │
    ┌─────┴──────┐
    │            │
 SUCCESS      FAILURE
    │            │
    ▼            ▼
 ┌────────────────────┐   ┌──────────────────┐
 │ Success Message    │   │ Error: Account   │
 │ Redirect to Login  │   │ not found or     │
 │                    │   │ password weak    │
 └────────┬───────────┘   └──────────────────┘
          │
    User logs in with
    new password ✅
          │
          ▼
 ┌────────────────────────────┐
 │ Dashboard                  │
 │ (User/Company/Admin)       │
 │ ✅ Password Reset Complete │
 └────────────────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────┐
│      Users              │
├─────────────────────────┤
│ _id (ObjectId)         │
│ name (String)          │
│ email (String)         │
│ password (String)      │
│ role: "user"           │
│ ...                    │
└────────────┬────────────┘
             │
             │ (password reset)
             │
             ▼
┌─────────────────────────┐
│       OTPs              │
├─────────────────────────┤
│ _id (ObjectId)         │
│ email (String) - Index │
│ otp (String)           │
│ createdAt (Date)       │ ← TTL Index (600s)
│                        │   Auto-delete after 10 min
└─────────────────────────┘

┌─────────────────────────┐
│    Companies            │
├─────────────────────────┤
│ _id (ObjectId)         │
│ name (String)          │
│ email (String)         │
│ password (String)      │
│ role: "company"        │
│ ...                    │
└────────────┬────────────┘
             │
             │ (password reset)
             │
             ▼
     ┌──────────────┐
     │   OTPs       │  ← Same collection
     └──────────────┘

┌─────────────────────────┐
│      Admins             │
├─────────────────────────┤
│ _id (ObjectId)         │
│ name (String)          │
│ email (String)         │
│ password (String)      │
│ role: "admin"          │
│ ...                    │
└────────────┬────────────┘
             │
             │ (password reset)
             │
             ▼
     ┌──────────────┐
     │   OTPs       │  ← Same collection
     └──────────────┘
```

---

## Code Flow (Pseudocode)

```
FORGOT PASSWORD FLOW:
─────────────────────
1. User submits email
2. Backend:
   a. VALIDATE email exists in any collection
   b. IF not found:
      - Return 404
   c. ELSE:
      - DELETE any existing OTP for this email
      - GENERATE random 6-digit OTP
      - CREATE OTP record with email + OTP + timestamp
      - SAVE to database
      - SEND email with OTP via Nodemailer
      - RETURN success + email
3. Frontend:
   - REDIRECT to /verify-otp?email=user@example.com

VERIFY OTP FLOW:
────────────────
1. User submits email + OTP
2. Backend:
   a. FIND OTP record matching email + otp
   b. IF not found OR expired:
      - Return 400 (Invalid/Expired)
   c. ELSE:
      - DELETE OTP record
      - RETURN success + email
3. Frontend:
   - REDIRECT to /reset-password?email=user@example.com

RESET PASSWORD FLOW:
────────────────────
1. User submits email + password
2. Backend:
   a. VALIDATE password strength
   b. FIND account (user OR company OR admin)
   c. IF not found:
      - Return 404
   d. ELSE:
      - HASH password with bcrypt(password, 10)
      - UPDATE account.password = hashed
      - SAVE to database
      - RETURN success
3. Frontend:
   - REDIRECT to /login
   - User can now login with new password ✅
```

---

## API Response Structures

```
SUCCESS RESPONSE - Forgot Password:
{
  "success": true,
  "message": "OTP sent to your email successfully.",
  "email": "user@example.com"
}

SUCCESS RESPONSE - Verify OTP:
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "email": "user@example.com"
}

SUCCESS RESPONSE - Reset Password:
{
  "success": true,
  "message": "User password updated successfully!"
}

ERROR RESPONSE - Email Not Found:
{
  "success": false,
  "message": "Email not found in any account."
}

ERROR RESPONSE - Invalid OTP:
{
  "success": false,
  "message": "Invalid or expired OTP."
}

ERROR RESPONSE - Server Error:
{
  "success": false,
  "message": "Server error. Please try again later."
}
```

---

## Security Matrix

```
┌─────────────────────┬────────────────┬──────────────────────────┐
│ Security Aspect     │ Implementation │ Strength                 │
├─────────────────────┼────────────────┼──────────────────────────┤
│ OTP Uniqueness      │ 6-digit random │ 1,000,000 combinations   │
│ OTP Expiration      │ 10 minutes TTL │ Auto-cleanup, secure     │
│ One-Time Use        │ Delete after   │ OTP can't be reused      │
│                     │ verification   │                          │
│ Email Validation    │ Check all 3    │ Prevents OTP to unauth   │
│                     │ collections    │ email addresses          │
│ Password Storage    │ bcrypt hash    │ 10 rounds (industry std) │
│ Password Strength   │ Regex enforce  │ Min 8 chars + mixed case │
│                     │ 4+ char types  │ + number + special       │
│ Email Transport     │ TLS/SSL        │ Encrypted in transit     │
│ Auth Transport      │ HTTPS ready    │ Can use in production    │
│ Rate Limiting       │ Extensible     │ Code template provided   │
│ Session Mgmt        │ Token-based    │ No session hijacking     │
└─────────────────────┴────────────────┴──────────────────────────┘
```

---

This complete visual documentation shows the architecture, flow, data relationships, and security of the OTP implementation.
