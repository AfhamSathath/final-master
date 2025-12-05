# Register OTP API Reference

## Endpoint 1: Send OTP via Email

### Request
```http
POST /api/auth/register-send-otp
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent successfully to your email."
}
```

### Error Responses

**Email Already Registered (409)**
```json
{
  "success": false,
  "message": "Email is already registered. Please login or use a different email."
}
```

**Missing Email (400)**
```json
{
  "success": false,
  "message": "Email is required."
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Failed to send OTP. Please try again later."
}
```

### What Happens Behind the Scenes
1. Email validated and trimmed
2. Checks if email exists in User/Company/Admin collections
3. Generates 6-digit random OTP
4. Deletes old OTPs for this email
5. Saves OTP to MongoDB (auto-deletes after 10 minutes)
6. Sends HTML email with Nodemailer
7. Returns success response

### Backend Code
```javascript
router.post("/register-send-otp", async (req, res) => {
  const { email, name } = req.body;
  
  // Validate
  // Check duplicates
  // Generate OTP
  // Save to DB
  // Send email
  // Return response
});
```

---

## Endpoint 2: Verify OTP

### Request
```http
POST /api/auth/register-verify-otp
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully. Proceed with registration."
}
```

### Error Responses

**Invalid OTP (400)**
```json
{
  "success": false,
  "message": "Invalid OTP. Please try again."
}
```

**OTP Expired (404)**
```json
{
  "success": false,
  "message": "OTP not found or has expired. Please request a new one."
}
```

**Missing Fields (400)**
```json
{
  "success": false,
  "message": "Email is required."
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Server error. Please try again later."
}
```

### What Happens Behind the Scenes
1. Email and OTP validated
2. Finds OTP record in database
3. Compares provided OTP with stored OTP
4. **Deletes OTP after successful verification** (one-time use)
5. Returns success response

### Backend Code
```javascript
router.post("/register-verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  
  // Validate
  // Find OTP in DB
  // Compare OTP
  // Delete OTP (one-time use)
  // Return response
});
```

---

## Complete Registration Flow Example

### Step 1: Send OTP
```javascript
// Frontend sends
POST /api/auth/register-send-otp
{
  "email": "user@example.com",
  "name": "User Name"
}

// Backend responds with
{
  "success": true,
  "message": "OTP sent successfully to your email."
}

// Server console shows:
📧 EMAIL WOULD BE SENT:
   To: user@example.com
   Subject: Email Verification - Registration OTP
   🔑 OTP: 456789
```

### Step 2: Verify OTP
```javascript
// Frontend sends (user enters OTP from email)
POST /api/auth/register-verify-otp
{
  "email": "user@example.com",
  "otp": "456789"
}

// Backend responds with
{
  "success": true,
  "message": "Email verified successfully. Proceed with registration."
}
```

### Step 3: Register Account
```javascript
// Frontend sends (after OTP verification)
POST /api/users (or /api/companies)
{
  "name": "User Name",
  "email": "user@example.com",
  "contactNumber": "0771234567",
  "password": "HashedPassword123!"
}

// Backend creates account and responds
{
  "success": true,
  "_id": "507f1f77bcf86cd799439011",
  "message": "User created successfully"
}
```

---

## Email Template Example

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Job Portal!</h2>
  
  <p>Hi John Doe,</p>
  
  <p>Thank you for registering. Please verify your email address to complete your registration.</p>
  
  <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center;">
    <p>Your verification code is:</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">
      456789
    </p>
    <p>This code will expire in 10 minutes</p>
  </div>
  
  <p>If you did not sign up for this account, please ignore this email.</p>
  
  <hr>
  <p style="font-size: 12px; text-align: center;">© 2025 Job Portal. All rights reserved.</p>
</div>
```

---

## Using with cURL (Testing)

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/register-send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/register-verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

---

## Database Records

### OTP Collection Document
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",      // lowercase, indexed
  otp: "456789",                   // 6 digits
  createdAt: ISODate("..."),       // Auto-deleted after 10 minutes (TTL index)
}
```

### User Collection Document (after registration)
```javascript
{
  _id: ObjectId("..."),
  name: "User Name",
  email: "user@example.com",
  contactNumber: "0771234567",
  password: "$2a$10$...",           // bcrypt hashed
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## Security Notes

✅ OTP is 6 random digits (1,000,000 possible values)  
✅ OTP auto-expires after 10 minutes  
✅ OTP is one-time use (deleted after verification)  
✅ Email validated before OTP generation  
✅ Passwords are bcrypt hashed  
✅ No sensitive info in error messages  
✅ Input sanitization on all fields  

---

## Troubleshooting

### "Failed to send OTP" on Frontend
- Check if backend is running
- Check server console for errors
- Verify email format is valid

### OTP not appearing in server console
- Make sure you're looking at the correct terminal (server, not frontend)
- Restart backend server
- Check OTP was actually sent (look for "EMAIL WOULD BE SENT" log)

### "OTP not found or has expired"
- OTP expires after 10 minutes
- User took too long to verify
- Solution: User clicks "Resend OTP" button

### Duplicate email error
- Email is already registered in system
- Solution: User must login or use different email

---

## Switching to Real Email (Gmail)

To send actual emails instead of console logging:

1. Get Gmail App Password (instructions in REGISTER_NODEMAILER_SETUP.md)
2. Update authRoutes.js:

```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,        // Gmail address
    pass: process.env.EMAIL_PASS,        // App password
  },
});
```

3. Update .env file with real credentials
4. Restart backend server
5. Test registration flow - emails will be sent instead of logged
