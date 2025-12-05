# Email Configuration Example

## Using Gmail with App Password (Recommended)

### Step 1: Enable 2-Factor Authentication

Go to https://myaccount.google.com/security and:
1. Click "2-Step Verification"
2. Follow the setup process
3. Confirm your phone number

### Step 2: Generate App Password

1. Go back to Security page
2. Scroll down to "App passwords" (only visible if 2FA is enabled)
3. Select:
   - Device: "Windows Computer" (or your device)
   - App: "Mail"
4. Google generates a 16-character password
5. Copy this password immediately

### Step 3: Configure Environment

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finaljob_edu
CLIENT_URL=http://localhost:8080
JWT_SECRET=23c1674ca310f5ddf32b4c1705144e5aa695e151436b72ecac00d94997e779746480cad6332b6182
EMAIL_USER=your-name@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Example (with real values):**
```env
EMAIL_USER=techsupp@gmail.com
EMAIL_PASS=axmz mhgt zqpx nfvk
```

---

## Using Alternative Email Providers

### Gmail (Default - What We Use)
```javascript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransport({
  service: "outlook",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### Custom SMTP Server
```javascript
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

---

## Testing Email Configuration

### Option 1: Using Postman

1. Open Postman
2. Create POST request to: `http://localhost:5000/api/auth/forgot-password`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "email": "your-registered-email@gmail.com"
}
```
5. Send
6. Check your email for OTP

### Option 2: Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

### Option 3: Using Frontend

1. Start dev server: `npm run dev` (in clientnew)
2. Go to `http://localhost:8080/forgot-password`
3. Enter your registered email
4. Click "Send OTP"
5. Check email inbox

---

## Troubleshooting Email Issues

### Issue: "Invalid login credentials"
**Solution:**
- Verify EMAIL_USER and EMAIL_PASS in `.env`
- Make sure 2FA is enabled on Gmail
- Use App Password, not regular password
- App Password should have spaces: `xxxx xxxx xxxx xxxx`

### Issue: "Login failed"
**Solution:**
- Ensure 2-Step Verification is enabled
- Go to https://myaccount.google.com/apppasswords
- Regenerate app password
- Update `.env` with new password

### Issue: "Less secure app access"
**Solution:**
- Don't use regular Gmail password
- Always use App Password with 2FA enabled
- App Password is more secure

### Issue: "Email not sending"
**Solution:**
```javascript
// Add this to test connection before sending:
transporter.verify((error, success) => {
  if (error) {
    console.log("Email error:", error);
  } else {
    console.log("✅ Email server ready");
  }
});
```

### Issue: "Connection timeout"
**Solution:**
- Check if Gmail is blocking the connection
- Verify port 587 (TLS) is not blocked by firewall
- Try port 465 (SSL) instead:
```javascript
host: "smtp.gmail.com",
port: 465,
secure: true,  // SSL/TLS
```

---

## Email Template Customization

Current template location: `server/Routes/authRoutes.js` (in POST `/api/auth/forgot-password`)

To customize the email:
```javascript
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: trimmedEmail,
  subject: "YOUR CUSTOM SUBJECT",
  html: `
    <!-- Your custom HTML here -->
    <h1>Custom Message</h1>
    <p>OTP: ${otp}</p>
  `,
};
```

Available variables:
- `${otp}` - The generated OTP code
- `${trimmedEmail}` - User's email address

---

## Security Best Practices

✅ **DO:**
- Use App Password with 2FA enabled
- Store credentials in `.env` (never commit to git)
- Use HTTPS in production
- Regenerate app password if compromised
- Keep OTP expiration time short (10 minutes)
- Use email verification in combination with OTP

❌ **DON'T:**
- Use regular Gmail password (less secure)
- Commit `.env` file to git repository
- Use OTP longer than 15 minutes
- Log sensitive data (emails, OTPs)
- Test with production email accounts in development

---

## Production Considerations

For production environment:
1. Use environment variables from hosting provider (Heroku, AWS, etc.)
2. Never commit `.env` to repository
3. Use separate email account for application
4. Consider email rate limiting:
```javascript
// Simple rate limiting example
const otpAttempts = {};
const MAX_ATTEMPTS = 3;
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour

if (otpAttempts[email] > MAX_ATTEMPTS) {
  return res.status(429).json({ message: "Too many attempts. Try again later." });
}
```
5. Monitor email service logs
6. Set up alerts for email failures

---

## Support Resources

- Nodemailer Documentation: https://nodemailer.com/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- OAuth2 for Gmail: https://nodemailer.com/smtp/oauth2/
- SMTP Configuration: https://nodemailer.com/smtp/
