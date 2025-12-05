# Register Component with Nodemailer Email Verification

## Overview
The Register.tsx component has been fully updated to integrate with Nodemailer for email verification during the registration process. Users must verify their email via OTP before completing registration.

## Registration Flow

### Step 1: Registration Form
- User enters name, email, phone, password, account type (user/company)
- Form validation using Zod schema
- Company-specific fields: registration number, address, company verification
- On submit: Form validates, checks for duplicates, then sends OTP via email

### Step 2: Email Verification (OTP)
- Backend generates 6-digit OTP and stores in MongoDB (with 10-minute TTL)
- Nodemailer sends HTML email with formatted OTP to user
- User receives email and enters OTP on the OTP verification screen
- User can resend OTP if needed

### Step 3: Registration Completion
- After OTP verification, user is registered as User or Company account
- User redirected to Login page
- Account is ready to use

## Frontend Changes (Register.tsx)

### New/Updated Functions

#### `sendOtp()`
Calls backend endpoint `/api/auth/register-send-otp` to send OTP via email.
```tsx
const sendOtp = async () => {
  try {
    setLoading(true);
    
    const response = await axios.post(`${API_BASE}/api/auth/register-send-otp`, {
      email: formData.email,
      name: formData.name,
    });

    if (response.status === 200) {
      toast.success(`📩 OTP sent to ${formData.email}`);
      setOtpSent(true);
      setLoading(false);
    }
  } catch (err: any) {
    const msg = err?.response?.data?.message || "Failed to send OTP. Try again later.";
    toast.error(`❌ ${msg}`);
    setLoading(false);
  }
};
```

#### `resendOtp()`
Allows user to request a new OTP if they don't receive it or it expires.
```tsx
const resendOtp = async () => {
  try {
    setLoading(true);
    
    const response = await axios.post(`${API_BASE}/api/auth/register-send-otp`, {
      email: formData.email,
      name: formData.name,
    });

    if (response.status === 200) {
      toast.success("📩 OTP resent successfully!");
      setEnteredOtp("");
      setLoading(false);
    }
  } catch (err: any) {
    const msg = err?.response?.data?.message || "Failed to resend OTP.";
    toast.error(`❌ ${msg}`);
    setLoading(false);
  }
};
```

#### `verifyOtpAndRegister()`
Verifies OTP with backend, then registers user/company account.
```tsx
const verifyOtpAndRegister = async () => {
  if (!enteredOtp.trim()) {
    toast.error("❌ Please enter the OTP");
    return;
  }

  try {
    setLoading(true);

    // Step 1: Verify OTP with backend
    const verifyResponse = await axios.post(`${API_BASE}/api/auth/register-verify-otp`, {
      email: formData.email,
      otp: enteredOtp,
    });

    if (!verifyResponse.data.success) {
      toast.error("❌ Invalid OTP. Please try again.");
      setLoading(false);
      return;
    }

    // Step 2: Register user or company
    // ... calls /api/users or /api/companies endpoint
  } catch (error: any) {
    toast.error(`❌ ${error?.response?.data?.message}`);
    setLoading(false);
  }
};
```

### Key Features
- ✅ Zod validation for form fields (email format, password strength, phone)
- ✅ Company verification with keyword matching
- ✅ Duplicate email/phone/registration number checking
- ✅ OTP sent via Nodemailer with HTML template
- ✅ OTP verification before account creation
- ✅ Resend OTP functionality
- ✅ Loading states and error handling
- ✅ Responsive design with Tailwind CSS
- ✅ React Hot Toast notifications

## Backend Changes (authRoutes.js)

### New Endpoints

#### `POST /api/auth/register-send-otp`
**Purpose:** Generate OTP and send via email

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Email is already registered. Please login or use a different email."
}
```

**Behavior:**
1. Validates email is provided
2. Checks if email already exists in User, Company, or Admin collections
3. Generates 6-digit random OTP
4. Deletes any previous OTPs for this email
5. Saves OTP to MongoDB with TTL index (auto-deletes after 10 minutes)
6. Sends HTML email with formatted OTP using Nodemailer
7. Returns success response

#### `POST /api/auth/register-verify-otp`
**Purpose:** Verify OTP matches what was sent to email

**Request Body:**
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
  "message": "Email verified successfully. Proceed with registration."
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid OTP. Please try again."
}
```

**Behavior:**
1. Validates email and OTP are provided
2. Finds OTP record in database
3. Compares provided OTP with stored OTP
4. Deletes OTP after successful verification (one-time use only)
5. Returns success/error response

### Key Features
- ✅ Checks for duplicate emails before sending OTP
- ✅ 6-digit OTP generation
- ✅ MongoDB TTL index for auto-expiration (10 minutes)
- ✅ HTML email template with formatted OTP
- ✅ One-time OTP usage (deleted after verification)
- ✅ Comprehensive error handling and validation

## Email Template

The OTP email uses a professional HTML template:
- Welcome message with user's name
- Clear OTP display with styling
- 10-minute expiration notice
- Company branding footer
- Responsive design

Example OTP in email:
```
Your verification code is:
123456

This code will expire in 10 minutes
```

## Database Models Used

### OTP Schema (server/models/OTP.js)
```javascript
{
  email: String (lowercase, indexed),
  otp: String (6 digits),
  createdAt: Date (auto-delete after 10 minutes via TTL index)
}
```

### User/Company Collections
- Checked for duplicate emails before sending OTP
- Account created after OTP verification

## Testing the Flow

### Prerequisites
- Backend running: `npm start` (in server folder)
- Frontend running: `npm run dev` (in clientnew folder)

### Test Steps

1. **Open Registration Page**
   - Navigate to http://localhost:8080/register
   
2. **Fill Registration Form**
   - Name: "Test User"
   - Email: "test@example.com" (must not already exist)
   - Phone: "0771234567"
   - Password: "TestPass123!" (must meet requirements)
   - Account Type: "User"
   
3. **Submit Registration**
   - Click "Register" button
   - Wait for OTP to be sent
   - Toast notification: "OTP sent to test@example.com"
   
4. **Check Server Console**
   - In server terminal, look for OTP output:
   ```
   📧 EMAIL WOULD BE SENT:
      To: test@example.com
      Subject: Email Verification - Registration OTP
      🔑 OTP: 123456
   ```
   
5. **Verify Email**
   - Copy OTP from console
   - Enter into OTP input field on frontend
   - Click "Verify & Register"
   
6. **Account Created**
   - Toast: "User registered successfully!"
   - Redirect to Login page
   - Can now login with email and password

## Dev Mode Note

**Current Mode:** Dev Mode Console Logging
- OTPs are logged to server console instead of sent via actual email
- Allows testing without Gmail/email credentials
- Perfect for development and testing

**To Enable Real Email:**
1. Set up Gmail App Password or use another email service
2. Update `transporter` in authRoutes.js with real Nodemailer config
3. Update `mailOptions.from` with real sender email

## Error Handling

### Common Errors and Solutions

**"Email is already registered"**
- User already has account with this email
- Solution: Use different email or login with existing account

**"OTP not found or has expired"**
- OTP expired (10-minute limit) or never sent
- Solution: Click "Resend OTP" to get new code

**"Invalid OTP"**
- Entered OTP doesn't match what was sent
- Solution: Check server console for correct OTP, re-enter carefully

**"Failed to send OTP"**
- Server error
- Solution: Check server is running, check internet connection

## Security Features

✅ Password strength requirements (8+ chars, uppercase, lowercase, number, special char)
✅ Email validation before OTP generation
✅ OTP one-time use (deleted after verification)
✅ OTP auto-expires after 10 minutes
✅ Duplicate email checking
✅ Input sanitization and trimming
✅ Error messages don't expose sensitive info
✅ Phone number validation (9-10 digits)

## Files Modified

1. **clientnew/src/pages/Register.tsx**
   - Updated `sendOtp()` function to call backend
   - Added `resendOtp()` function
   - Updated `verifyOtpAndRegister()` to verify with backend first
   
2. **server/Routes/authRoutes.js**
   - Added `/api/auth/register-send-otp` endpoint
   - Added `/api/auth/register-verify-otp` endpoint

## Related Documentation

- OTP Model: `server/models/OTP.js`
- Password Reset Flow: Uses similar `/api/auth/forgot-password` endpoint
- Authentication: `server/Controllers/authController.js`

## Future Enhancements

- Rate limiting on OTP requests (prevent spam)
- SMS OTP as alternative to email
- Email change verification for existing accounts
- Bulk email delivery service integration
- OTP attempt tracking and lockout
