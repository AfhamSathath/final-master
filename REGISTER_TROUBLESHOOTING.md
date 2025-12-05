# Register Component - Troubleshooting Guide

## Common Issues and Solutions

### 1. "Email is already registered" Error

**Problem:** User tries to register with email that already exists

**Causes:**
- Email already used by another account
- User previously registered with this email
- Database duplicate from testing

**Solutions:**
```
Option A: Use Different Email
1. Tell user to use different email address
2. Click back on registration form
3. Enter new email
4. Complete registration again

Option B: Check Database
1. Connect to MongoDB
2. Check users collection: db.users.find({email: "test@example.com"})
3. If it's test data, delete it: db.users.deleteOne({email: "test@example.com"})
4. User can now register with that email

Option C: Password Reset
1. If it's their existing account
2. Direct them to /forgot-password
3. Let them reset password
4. Login with new password
```

**Prevention:**
- Inform user of duplicate check before registration
- Suggest unique email variations
- Add "Check if email is available" button

---

### 2. "OTP not found or has expired" Error

**Problem:** User gets OTP expired error when trying to verify

**Causes:**
- User waited > 10 minutes before verifying
- OTP was never sent (check server logs)
- Database connection issue
- Multiple OTP requests created duplicates

**Solutions:**
```
Option A: Resend OTP (Recommended)
1. Click "Resend OTP" button on verification screen
2. New OTP will be generated
3. Check server console for new OTP
4. Enter new OTP and verify
5. Complete registration

Option B: Start Over
1. Navigate back to /register
2. Fill form again
3. Click Register
4. New OTP will be sent
5. Verify and complete

Option C: Check Server Status
1. Check if backend is running
2. Check if MongoDB is running
3. Check server console for errors
4. Restart server if needed
```

**Prevention:**
- Add countdown timer showing OTP expiration
- Warn user about 10-minute limit
- Allow unlimited resend attempts
- Pre-fill email on verification screen

---

### 3. "Invalid OTP" Error

**Problem:** User enters OTP but gets invalid error

**Causes:**
- Wrong OTP entered
- User entered different OTP than what was sent
- Typo in OTP
- Using old OTP after resend

**Solutions:**
```
Option A: Check OTP Value
1. Look at server console output
2. Find line that says: 🔑 OTP: 123456
3. Copy the exact number (6 digits)
4. Clear OTP input field
5. Paste OTP carefully
6. Click Verify

Option B: Resend OTP
1. Click "Resend OTP" button
2. Check server console for new OTP
3. Use the NEW OTP (old one is deleted)
4. Enter and verify

Option C: Slow Network
1. Wait a moment
2. Try entering OTP again
3. If still fails, try resend

Option D: Clear Browser Cache
1. Clear cookies and cache
2. Reload page: F5 or Ctrl+R
3. Fill form again
4. Request new OTP
5. Verify
```

**Prevention:**
- Copy-paste OTP instead of typing
- Show OTP in larger font
- Add OTP format validation (6 digits only)
- Clear OTP input on resend
- Show remaining time for OTP validity

---

### 4. "Failed to send OTP" Error

**Problem:** OTP sending fails completely

**Causes:**
- Backend server not running
- MongoDB not running
- Network connection issue
- Email service configuration issue
- Invalid email format

**Solutions:**
```
Option A: Check Backend Server
1. Open terminal where you ran "npm start"
2. Look for "✅ Server running on port 5000"
3. If not running, do:
   cd server
   npm start
4. Wait for server to start
5. Try registration again

Option B: Check MongoDB
1. Verify MongoDB is running
2. Linux/Mac: brew services list
3. Windows: Check Services app
4. Start MongoDB if stopped
5. Try registration again

Option C: Check Email Service
1. In server console, look for:
   "✅ Email transporter (DEV MODE) is ready"
2. If not there, restart server
3. Check for errors in console

Option D: Check Network
1. Test internet connection
2. Try from different network
3. Check if firewall blocking requests
4. Disable VPN if enabled
5. Try again

Option E: Check Email Format
1. Ensure email is valid format
2. Example: user@example.com ✓
3. Invalid: user@com ✗
4. Invalid: @example.com ✗
5. Try with valid email
```

**Prevention:**
- Log server startup status clearly
- Check database connection before accepting requests
- Validate email format before sending OTP
- Add retry logic with exponential backoff
- Send detailed error messages to frontend

---

### 5. No OTP in Server Console

**Problem:** User clicks Register but no OTP appears in server console

**Causes:**
- Wrong terminal (looking at frontend instead of backend)
- Backend not running
- Backend crashed/restarted
- Form validation failed before sending
- Email address has issue

**Solutions:**
```
Option A: Check Backend Terminal
1. Look at DIFFERENT terminal (server one)
2. Not the frontend terminal
3. Should have "npm start" running there
4. Look for: 📧 EMAIL WOULD BE SENT
5. Look for: 🔑 OTP: 123456

Option B: Restart Backend
1. In server terminal, press Ctrl+C to stop
2. Run: npm start
3. Wait for startup messages
4. Look for: "✅ Server running on port 5000"
5. Look for: "✅ Email transporter ready"
6. Try registration again

Option C: Check Form Validation
1. Look at browser console (F12)
2. Check for validation errors
3. Ensure all fields filled correctly
4. Try with valid data:
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "0771234567"
   - Password: "Test@123456"
   - Type: "user"
5. Try again

Option D: Check Email Format
1. Make sure email is valid
2. Correct: user@example.com ✓
3. Wrong: user @example.com ✗ (space)
4. Wrong: user@.com ✗ (no domain)
5. Use valid email

Option E: Clear Console & Try Again
1. In server console, select all (Ctrl+A)
2. Delete all previous output (to see fresh logs)
3. On frontend, fill form carefully
4. Click Register
5. Watch server console - new OTP should appear
```

**Prevention:**
- Label console output clearly ("BACKEND" vs "FRONTEND")
- Add visual separator when OTP is generated
- Log timestamp with OTP
- Add emoji indicators for success/failure
- Log to file as well as console

---

### 6. "Password must have..." Validation Errors

**Problem:** Password validation fails with requirements

**Causes:**
- Password too short (< 8 characters)
- No uppercase letter
- No lowercase letter
- No number
- No special character
- Passwords don't match

**Solutions:**
```
Password Requirements:
✓ Minimum 8 characters
✓ At least one UPPERCASE letter (A-Z)
✓ At least one lowercase letter (a-z)
✓ At least one number (0-9)
✓ At least one special character (@$!%*?&)

Example VALID passwords:
- Test@1234
- MyPass@123
- Secure#2024
- MyPassword@1

Example INVALID passwords:
- test123 (no uppercase, no special char)
- TEST@123 (no lowercase)
- Password (no number, no special char)
- Pass@1 (too short)
- MyPassword (no number, no special char)

How to Fix:
1. Clear password field
2. Enter new password with ALL requirements:
   ✓ MyPass@123 (has uppercase M, lowercase ass, number 123, special @)
3. Type same password in "Confirm Password"
4. Click Register
5. Continue to OTP verification
```

**Prevention:**
- Show password strength meter
- List requirements clearly on form
- Show checkmarks as requirements met
- Allow eye icon to reveal password while typing
- Provide example valid passwords

---

### 7. "Phone number must be 9-10 digits" Error

**Problem:** Phone validation fails

**Causes:**
- Letters in phone number
- Wrong number of digits
- Spaces or special characters

**Solutions:**
```
Valid Phone Numbers:
✓ 0771234567 (10 digits)
✓ 771234567 (9 digits)
✓ 9876543210 (10 digits)

Invalid Phone Numbers:
✗ 077-123-4567 (has dashes)
✗ +94771234567 (has +94 prefix)
✗ 077 123 4567 (has spaces)
✗ phone (letters)
✗ 077123 (only 6 digits)

How to Fix:
1. Remove any dashes or spaces
2. Remove country code if present
3. Ensure only numbers
4. Use 9 or 10 digits total
5. Example: 0771234567
6. Click Register
```

**Prevention:**
- Remove non-numeric characters automatically
- Accept both 9 and 10 digit formats
- Show format example in placeholder
- Validate as user types

---

### 8. Page Not Loading / Blank Screen

**Problem:** Registration page shows blank or error

**Causes:**
- Frontend not running
- Bundle compilation failed
- Browser console errors
- Network issue
- Wrong URL

**Solutions:**
```
Option A: Check Frontend Running
1. Open terminal where you ran "npm run dev"
2. Look for: "Local: http://localhost:8080"
3. Or check: "5173" port mentioned
4. If not running, do:
   cd clientnew
   npm run dev
5. Wait for compilation
6. Open correct URL in browser

Option B: Check Browser Console
1. Press F12 to open developer tools
2. Go to "Console" tab
3. Look for red errors
4. Common errors:
   - "Cannot GET /register" → URL wrong
   - "API not found" → Backend not running
   - "Module not found" → Dependencies missing

Option C: Clear Browser Cache
1. Press Ctrl+Shift+Del
2. Select "All time"
3. Check "Cookies and cached images"
4. Click "Clear data"
5. Go back to http://localhost:8080/register
6. Refresh page (F5)

Option D: Install Dependencies
1. Check if node_modules exist
2. If missing, run:
   cd clientnew
   npm install
3. Then run:
   npm run dev
4. Open browser to correct port

Option E: Check URL
1. Should be: http://localhost:8080/register
2. Not: http://localhost:5000/register
3. Not: http://localhost:3000/register
4. Port 8080 is frontend
5. Port 5000 is backend
```

**Prevention:**
- Display clear startup messages
- Check both backend and frontend are running
- Validate imports and components
- Use error boundaries to catch crashes
- Log errors to file

---

### 9. Registration Stuck at OTP Screen

**Problem:** After clicking "Verify & Register", nothing happens

**Causes:**
- Slow network
- Backend processing taking too long
- Account creation failed silently
- JavaScript error in console

**Solutions:**
```
Option A: Check for Errors
1. Press F12 (Developer Tools)
2. Go to "Console" tab
3. Look for red error messages
4. Note any error details
5. Check "Network" tab for failed requests

Option B: Wait Longer
1. Sometimes account creation takes time
2. Wait 5-10 seconds
3. Check if page redirects to login
4. If redirected, registration succeeded
5. Try login with email and password

Option C: Reload Page
1. Press F5 to reload
2. If redirected to login, registration worked
3. Try logging in
4. If still on OTP screen, try verifying again

Option D: Check Backend Logs
1. Go to backend terminal
2. Look for error messages
3. Check if server is still running
4. Look for database connection errors
5. Restart backend if needed

Option E: Try Different OTP
1. Click "Resend OTP"
2. Check server console for new OTP
3. Enter NEW OTP (old one is deleted)
4. Click "Verify & Register" again
5. This might resolve temporary issues
```

**Prevention:**
- Show loading spinner with "Creating account..."
- Set timeout for slow operations
- Log all server-side errors
- Return meaningful error messages
- Add success animation before redirect

---

### 10. Cannot Find Backend at localhost:5000

**Problem:** Frontend cannot connect to backend

**Causes:**
- Backend not running
- Backend running on different port
- CORS not configured
- Network blocked

**Solutions:**
```
Option A: Check Backend Status
1. Open browser
2. Go to: http://localhost:5000/
3. If connection refused, backend not running
4. Start backend:
   cd server
   npm start
5. Wait for: "✅ Server running on port 5000"

Option B: Check Frontend API_BASE
1. Open clientnew/src/pages/Register.tsx
2. Look at line with: const API_BASE = "..."
3. Should be: const API_BASE = "http://localhost:5000"
4. If different, update it
5. Save file
6. Frontend will reload automatically

Option C: Check CORS Configuration
1. Backend should have CORS enabled
2. Check server/src/app.js or server/serve.js
3. Look for: app.use(cors())
4. If missing, add it:
   import cors from "cors";
   app.use(cors());
5. Restart backend

Option D: Check Port Numbers
Frontend: localhost:8080 ✓
Backend: localhost:5000 ✓
Database: localhost:27017 ✓

If different, update accordingly

Option E: Check Firewall
1. Firewall might block localhost
2. Temporarily disable firewall
3. Try registration again
4. If works, add exception for port 5000
5. Re-enable firewall
```

**Prevention:**
- Display connection status in UI
- Show clear error when backend unreachable
- Make API_BASE configurable
- Add health check endpoint
- Log connection attempts

---

## Debugging Checklist

Before reporting issue, check:

- [ ] Backend running? (`npm start` in server folder shows no errors)
- [ ] Frontend running? (`npm run dev` in clientnew folder shows no errors)
- [ ] MongoDB running? (Check services or terminal)
- [ ] Correct URL? (http://localhost:8080/register)
- [ ] Form filled correctly? (All fields valid data)
- [ ] OTP visible in server console? (Look at right terminal)
- [ ] Correct OTP entered? (Copy from console)
- [ ] Browser console clear? (F12 → Console tab)
- [ ] Network tab shows requests? (F12 → Network tab)
- [ ] .env file configured? (Both frontend and backend)

---

## Getting Help

If issue persists:

1. **Screenshot the error** - Take screenshot of toast/alert
2. **Check server console** - Copy any error messages
3. **Check browser console** - F12 → Console → Copy errors
4. **Check network tab** - F12 → Network → Find failed request
5. **Note exact steps** - How to reproduce the issue
6. **Check logs** - Look for detailed error info

Share:
- Error message
- Steps to reproduce
- Server console output
- Browser console output (if any)
- Network tab failed requests

---

## Testing Checklist

Mark as you complete each test:

Registration Form Tests:
- [ ] Can fill all fields
- [ ] Validation works for invalid input
- [ ] Password visibility toggle works
- [ ] Company fields show/hide with type
- [ ] Company verification button works

OTP Tests:
- [ ] OTP sent successfully
- [ ] OTP appears in server console
- [ ] Can enter OTP on verification screen
- [ ] Correct OTP accepts verification
- [ ] Incorrect OTP shows error
- [ ] Resend OTP generates new code
- [ ] Can verify with resent OTP

Account Creation Tests:
- [ ] Account created after OTP verification
- [ ] Redirected to login page
- [ ] Can login with registered email
- [ ] Can login with registered password

Error Handling Tests:
- [ ] Duplicate email shows error
- [ ] Invalid password shows error
- [ ] Invalid phone shows error
- [ ] Expired OTP shows error
- [ ] Backend down shows error

---

## Performance Tips

If registration is slow:

1. **Check Network Speed** - Slow internet affects OTP delivery
2. **Check Server Load** - Too many requests can slow response
3. **Optimize Database** - Add indexes to email field
4. **Enable Compression** - gzip responses
5. **Use CDN** - Serve frontend from CDN
6. **Monitor Memory** - Check if backend has memory leak
7. **Check Logs** - Look for slow operations

---

## Security Checklist

- [ ] Password hashing enabled (bcryptjs)
- [ ] OTP is random 6 digits
- [ ] OTP expires after 10 minutes
- [ ] OTP is one-time use only
- [ ] Email validation prevents issues
- [ ] No passwords in logs
- [ ] No OTPs in response body
- [ ] HTTPS configured (production)
- [ ] Rate limiting on OTP requests
- [ ] Database access secured

---

## Success Indicators

You'll know it's working when:

✅ Form loads at http://localhost:8080/register
✅ Can fill form with valid data
✅ Click Register button
✅ OTP appears in server console
✅ OTP verification screen appears
✅ Can enter OTP and verify
✅ Account created successfully
✅ Redirected to login page
✅ Can login with email and password

If all ✅, registration OTP system is working!
