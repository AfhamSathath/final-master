# Register Component - Visual Guides

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION JOURNEY                     │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────────────────────────┐
│  SCREEN 1: Registration Form        │
│                                     │
│  ✓ Name/Company Name                │
│  ✓ Email                            │
│  ✓ Phone Number                     │
│  ✓ Password (8+ chars required)     │
│  ✓ Confirm Password                 │
│  ✓ Account Type (User/Company)      │
│  ✓ [Company: Registration #, Addr]  │
│                                     │
│  [Register Button]                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  VALIDATION                         │
│                                     │
│  • Email format check               │
│  • Password strength check          │
│  • Phone format check (9-10 digits) │
│  • Company verification (if needed) │
│  • Duplicate check (email, phone)   │
└────────────┬────────────────────────┘
             │
             ▼ (Validation passes)
┌─────────────────────────────────────┐
│  SEND OTP                           │
│                                     │
│  Frontend calls:                    │
│  POST /api/auth/register-send-otp   │
│                                     │
│  Backend:                           │
│  • Generates 6-digit OTP            │
│  • Saves to database (10 min TTL)   │
│  • Sends email via Nodemailer       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  SCREEN 2: OTP Verification         │
│                                     │
│  "We sent OTP to: user@email.com"   │
│                                     │
│  [OTP Input Field: 6 digits]        │
│                                     │
│  [Verify & Register Button]         │
│  [Resend OTP Button]                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  USER ACTION                        │
│                                     │
│  User checks email/server console   │
│  and enters 6-digit OTP             │
│                                     │
│  Then clicks "Verify & Register"    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  VERIFY OTP                         │
│                                     │
│  Frontend calls:                    │
│  POST /api/auth/register-verify-otp │
│                                     │
│  Backend:                           │
│  • Finds OTP in database            │
│  • Compares with entered OTP        │
│  • Deletes OTP (one-time use)       │
└────────────┬────────────────────────┘
             │
             ├─ Valid OTP ──────┐
             │                  │
             │ Invalid OTP ─┐   │
             │              │   │
             ▼              │   ▼
        [Error]       ┌──────────────────┐
    "Invalid OTP"     │  CREATE ACCOUNT  │
         │            │                  │
         │            │  POST /api/users │
         │            │  or              │
         │            │  /api/companies  │
         │            │                  │
         │            │  Backend:        │
         │            │  • Hash password │
         │            │  • Save to DB    │
         │            │  • Return token  │
         │            └────────┬─────────┘
         │                     │
         │                     ▼
         │            ┌──────────────────┐
         │            │  SUCCESS! 🎉     │
         │            │                  │
         │            │  Account created │
         │            │  Redirect to     │
         │            │  Login page      │
         │            └────────┬─────────┘
         │                     │
         │                     ▼
         │                   LOGIN
         │
         └──────────────────────┘
                    │
                    ▼
           Click "Resend OTP"
           (New OTP sent)
```

---

## Data Flow Between Frontend and Backend

```
┌──────────────────────┐
│   FRONTEND REACT     │
│   (Register.tsx)     │
└──────────┬───────────┘
           │
           │ 1. User fills form
           │    {name, email, phone, password, userType}
           │
           ▼
    ┌─────────────────────────────────────────┐
    │  Validation (Zod)                       │
    │  ✓ Email format                         │
    │  ✓ Password strength                    │
    │  ✓ Phone format                         │
    │  ✓ Passwords match                      │
    └──────┬──────────────────────────────────┘
           │
           │ 2. Calls sendOtp()
           │
           ├─────────────────────────────────────────────┐
           │                                             │
           ▼                                             │
    POST /api/auth/register-send-otp                     │
    {                                                    │
      "email": "user@example.com",                       │
      "name": "User Name"                               │
    }                                                    │
           │                                             │
           │ (HTTP Request)                              │
           │                                             │
           ▼                                             │
    ┌────────────────────────────────────┐              │
    │    BACKEND NODE.JS                 │              │
    │    (authRoutes.js)                 │              │
    └────────┬───────────────────────────┘              │
             │                                          │
             │ 3. register-send-otp endpoint            │
             │                                          │
             ├─────────────────────────────┐            │
             │                             │            │
             ▼                             │            │
      Validate email                       │            │
      Check User collection                │            │
      Check Company collection             │            │
      Check Admin collection               │            │
             │                             │            │
             ├─ Exists? ─────→ Error 409   │            │
             │                             │            │
             │ Doesn't exist ──┐           │            │
             │                 ▼           │            │
             │          ┌────────────────┐ │            │
             │          │ Generate OTP   │ │            │
             │          │ (6 random      │ │            │
             │          │  digits)       │ │            │
             │          └────────┬───────┘ │            │
             │                   │         │            │
             │                   ▼         │            │
             │          ┌────────────────┐ │            │
             │          │  Save to OTP   │ │            │
             │          │  Collection    │ │            │
             │          │  (TTL: 10 min) │ │            │
             │          └────────┬───────┘ │            │
             │                   │         │            │
             │                   ▼         │            │
             │          ┌────────────────┐ │            │
             │          │ Send Email     │ │            │
             │          │ (Nodemailer)   │ │            │
             │          └────────┬───────┘ │            │
             │                   │         │            │
             │                   ▼         │            │
             └─→ Success 200 Response      │            │
                {                          │            │
                  "success": true,         │            │
                  "message": "OTP sent"    │            │
                }                          │            │
             │                             │            │
             │←────────(HTTP Response)─────┘            │
             │                                          │
    ┌────────┴──────────────────────────────────────────┐
    │                                                   │
    ▼                                                   │
User sees OTP screen & enters OTP                       │
    │                                                   │
    │ 4. Calls verifyOtpAndRegister()                   │
    │                                                   │
    │                                                   ▼
    ├─────────────────────────────────────────────────────────┐
    │                                                         │
    ▼                                                         │
POST /api/auth/register-verify-otp                           │
{                                                            │
  "email": "user@example.com",                               │
  "otp": "123456"                                            │
}                                                            │
    │                                                        │
    │ (HTTP Request)                                         │
    │                                                        │
    ▼                                                        │
Backend: register-verify-otp endpoint                        │
    │                                                        │
    ├─ Find OTP in DB ──────┐                                │
    │                       │                                │
    │ ├─ Not found? ─→ Error 404                             │
    │ │                                                      │
    │ └─ Found ──→ Compare OTP                               │
    │                │                                       │
    │                ├─ Not match? ─→ Error 400              │
    │                │                                       │
    │                └─ Match ──→ Delete OTP (one-time use) │
    │                             │                          │
    │                             ▼                          │
    │                     Success 200 Response               │
    │                     {                                  │
    │                       "success": true,                 │
    │                       "message": "Verified"            │
    │                     }                                  │
    │                         │                              │
    │←──────(HTTP Response)────┘                             │
    │                                                        │
    ▼                                                        │
OTP Verified ✓                                               │
    │                                                        │
    │ 5. Calls axios.post(/api/users or /api/companies)    │
    │                                                        │
    ├────────────────────────────────────────────────┐       │
    │                                                │       │
    ▼                                                │       │
POST /api/users (or /api/companies)                  │       │
{                                                   │       │
  "name": "User Name",                              │       │
  "email": "user@example.com",                      │       │
  "contactNumber": "0771234567",                    │       │
  "password": "TestPassword123!"                    │       │
}                                                   │       │
    │                                                │       │
    │ (HTTP Request)                                 │       │
    │                                                │       │
    ▼                                                │       │
Backend: User or Company creation endpoint           │       │
    │                                                │       │
    ├─ Hash password (bcryptjs)                     │       │
    ├─ Create user document                         │       │
    ├─ Save to database                             │       │
    │                                                │       │
    └─→ Success 201 Response                         │       │
        {                                           │       │
          "_id": "507f1f77bcf86cd7...",             │       │
          "name": "User Name",                       │       │
          "email": "user@example.com",               │       │
          "message": "User created"                  │       │
        }                                           │       │
        │                                            │       │
        │←──────(HTTP Response)────────────────────┘       │
        │                                                    │
        ▼                                                    │
Account Created ✓                                           │
Redirect to /login page                                     │
```

---

## Request/Response Sequences

### Sequence 1: Send OTP
```
Frontend (User fills form)
    │
    │ sendOtp()
    │
    ├─→ POST /api/auth/register-send-otp
    │   {
    │     "email": "user@example.com",
    │     "name": "User Name"
    │   }
    │
    ▼
Backend
    │
    ├─ Validate email
    ├─ Check for duplicates
    ├─ Generate 6-digit OTP
    ├─ Save to database
    └─ Send email
    │
    ├─→ Response 200
    │   {
    │     "success": true,
    │     "message": "OTP sent successfully"
    │   }
    │
    ▼
Frontend
    │
    ├─ Show OTP verification screen
    ├─ Clear form
    └─ Wait for user input
```

### Sequence 2: Verify OTP
```
Frontend (User enters OTP)
    │
    │ verifyOtpAndRegister()
    │
    ├─→ POST /api/auth/register-verify-otp
    │   {
    │     "email": "user@example.com",
    │     "otp": "123456"
    │   }
    │
    ▼
Backend
    │
    ├─ Find OTP in database
    ├─ Compare with entered OTP
    └─ Delete OTP (one-time use)
    │
    ├─→ Response 200
    │   {
    │     "success": true,
    │     "message": "Email verified successfully"
    │   }
    │
    ▼
Frontend
    │
    └─→ Proceed to user/company creation
```

### Sequence 3: Create Account
```
Frontend (OTP verified)
    │
    │ verifyOtpAndRegister() continues
    │
    ├─→ POST /api/users (or /api/companies)
    │   {
    │     "name": "User Name",
    │     "email": "user@example.com",
    │     "contactNumber": "0771234567",
    │     "password": "TestPassword123!"
    │   }
    │
    ▼
Backend
    │
    ├─ Hash password
    ├─ Create document
    ├─ Save to database
    │
    ├─→ Response 201
    │   {
    │     "success": true,
    │     "message": "User created successfully",
    │     "_id": "507f1f77bcf86cd799439011"
    │   }
    │
    ▼
Frontend
    │
    ├─ Show success toast
    ├─ Redirect to /login
    └─ User can now login
```

---

## Component State Diagram

```
┌─────────────────────────────────────────────┐
│      Register Component State Machine       │
└─────────────────────────────────────────────┘

State 1: FORM_DISPLAY
    │
    │ formData = {name, email, phone, password, userType, ...}
    │ otpSent = false
    │ loading = false
    │
    │ User fills form and clicks "Register"
    │
    ▼
State 2: SENDING_OTP
    │
    │ otpSent = false
    │ loading = true
    │
    │ Frontend calls sendOtp()
    │ Backend generates OTP
    │
    │ Response received
    │
    ▼
State 3: OTP_VERIFICATION
    │
    │ otpSent = true
    │ loading = false
    │ enteredOtp = ""
    │
    │ User sees OTP screen
    │ User enters OTP
    │ User clicks "Verify & Register"
    │
    ▼
State 4: VERIFYING_OTP
    │
    │ loading = true
    │ enteredOtp = "123456"
    │
    │ Frontend calls verifyOtpAndRegister()
    │ Backend verifies OTP
    │
    │ OTP verified + Account created
    │
    ▼
State 5: REGISTRATION_COMPLETE
    │
    │ Account created successfully
    │ Redirect to /login
    │ User can login with credentials

Alternative Path (Error):
    │
    ├─→ Invalid OTP
    │   │
    │   ├─ Show error message
    │   ├─ Keep on OTP screen
    │   ├─ Allow resend
    │   │
    │   └─→ Click "Resend OTP"
    │       │
    │       └─→ Back to State 2 (SENDING_OTP)
    │           │
    │           └─→ New OTP sent
    │               Back to State 3
```

---

## Error Handling Flow

```
User Action
    │
    ▼
┌──────────────────────────┐
│ Input Validation         │
│ (Frontend - Zod)         │
└────────┬─────────────────┘
         │
         ├─ Email format invalid? ───→ Show form error
         ├─ Password too weak?  ───→ Show form error
         ├─ Phone format invalid? ───→ Show form error
         │
         └─ All valid ──→ Continue
                │
                ▼
    ┌───────────────────────┐
    │ Send OTP Request      │
    │ (Frontend to Backend) │
    └─────────┬─────────────┘
              │
              ├─→ Email already exists?
              │   │
              │   └─→ Response 409
              │       Toast: "Email already registered"
              │
              ├─→ Server error?
              │   │
              │   └─→ Response 500
              │       Toast: "Failed to send OTP"
              │
              └─→ Success
                  │
                  └─→ Response 200
                      Show OTP screen
                      │
                      ▼
        ┌─────────────────────────┐
        │ Verify OTP Request      │
        │ (Frontend to Backend)   │
        └────────┬────────────────┘
                 │
                 ├─→ OTP not found?
                 │   │
                 │   └─→ Response 404
                 │       Toast: "OTP expired"
                 │       Allow "Resend OTP"
                 │
                 ├─→ OTP mismatch?
                 │   │
                 │   └─→ Response 400
                 │       Toast: "Invalid OTP"
                 │       Keep OTP screen
                 │
                 └─→ Success
                     │
                     └─→ Response 200
                         Create account
                         │
                         ▼
            ┌──────────────────────┐
            │ Create Account       │
            │ (Post to /api/users) │
            └────────┬─────────────┘
                     │
                     ├─→ Server error?
                     │   │
                     │   └─→ Response 500
                     │       Toast: "Registration failed"
                     │
                     └─→ Success
                         │
                         └─→ Response 201
                             Account created
                             Redirect to login
```

---

## Component Hierarchy

```
App.tsx
└─ Routes
   └─ /register
      └─ Register.tsx
         ├─ State Management
         │  ├─ formData (useState)
         │  ├─ loading (useState)
         │  ├─ otpSent (useState)
         │  ├─ enteredOtp (useState)
         │  └─ errorMsg (useState)
         │
         ├─ Functions
         │  ├─ handleChange()
         │  ├─ handleSubmit()
         │  ├─ verifyCompany() [Company only]
         │  ├─ checkDuplicate()
         │  ├─ sendOtp()
         │  ├─ resendOtp()
         │  └─ verifyOtpAndRegister()
         │
         ├─ UI Components
         │  ├─ Toaster (from react-hot-toast)
         │  │
         │  ├─ Screen 1 (if !otpSent)
         │  │  ├─ Registration Form
         │  │  ├─ Input Fields
         │  │  │  ├─ Name
         │  │  │  ├─ Email
         │  │  │  ├─ Phone
         │  │  │  ├─ Password
         │  │  │  ├─ Confirm Password
         │  │  │  ├─ User Type Selector
         │  │  │  ├─ [Company fields if applicable]
         │  │  │  │  ├─ Registration Number
         │  │  │  │  ├─ Company Verify Button
         │  │  │  │  └─ Address
         │  │  │  └─ Submit Button
         │  │  └─ Login Link
         │  │
         │  └─ Screen 2 (if otpSent)
         │     ├─ OTP Title
         │     ├─ OTP Input Field
         │     ├─ Verify Button
         │     ├─ Resend Button
         │     └─ Login Link
         │
         └─ External Dependencies
            ├─ axios (HTTP requests)
            ├─ react-router-dom (navigation)
            ├─ react-hot-toast (notifications)
            ├─ zod (validation)
            ├─ lucide-react (icons)
            └─ tailwindcss (styling)
```

---

## Email Template Visual

```
┌──────────────────────────────────────────────┐
│                                              │
│     Welcome to Job Portal!                   │
│                                              │
│     Hi John Doe,                             │
│                                              │
│     Thank you for registering. Please        │
│     verify your email address to complete    │
│     your registration.                       │
│                                              │
│     ┌──────────────────────────────────┐    │
│     │                                  │    │
│     │  Your verification code is:      │    │
│     │                                  │    │
│     │        456789                    │    │
│     │                                  │    │
│     │  This code will expire in        │    │
│     │  10 minutes                      │    │
│     │                                  │    │
│     └──────────────────────────────────┘    │
│                                              │
│     If you did not sign up for this         │
│     account, please ignore this email.      │
│                                              │
│     ─────────────────────────────────       │
│                                              │
│     © 2025 Job Portal. All rights           │
│     reserved.                               │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Status Indicators

```
Registration Status Flow:

1️⃣ Filling Form
   └─ Name: [ ]
   └─ Email: [ ]
   └─ Phone: [ ]
   └─ Password: [ ]
   └─ Account Type: [ ]

2️⃣ Sending OTP
   Loading... ⏳

3️⃣ OTP Sent ✓
   Email: user@example.com
   [Enter 6-digit OTP...]
   [Verify Button]

4️⃣ Verifying OTP
   Loading... ⏳

5️⃣ Account Created ✓
   Redirecting to login...

Error States:
❌ "Email already registered"
❌ "Invalid OTP"
❌ "OTP expired - Click Resend"
❌ "Password too weak"
```
