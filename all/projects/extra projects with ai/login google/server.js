require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

const USERS_FILE = path.join(__dirname, 'users.json');

// In-memory cache for temporary OTP registrations
// Key: email (string), Value: { password (string), otp (string), expires (number) }
const otpCache = new Map();

// Set up Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static frontend files (index.html, style.css, app.js) from the current folder
app.use(express.static(__dirname));

// Helper function to read users database file safely
function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            const defaultUser = [{ email: 'user@gmail.com', password: 'password123' }];
            fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUser, null, 2), 'utf8');
            return defaultUser;
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading users file:', err);
        return [];
    }
}

// Helper function to save users database file safely
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing users file:', err);
        return false;
    }
}

// POST endpoint for login validation
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Backend Validation Checks
    if (!email) {
        return res.status(400).json({ success: false, field: 'email', message: 'Gmail address is required by the server' });
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        return res.status(400).json({ success: false, field: 'email', message: 'Server validation failed: Must be a valid @gmail.com address' });
    }

    if (!password) {
        return res.status(400).json({ success: false, field: 'password', message: 'Password is required by the server' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, field: 'password', message: 'Server validation failed: Password must be at least 6 characters' });
    }

    // Authenticate credentials against file-based users database
    const users = readUsers();
    const authenticatedUser = users.find(u => u.email === email && u.password === password);

    if (authenticatedUser) {
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            user: { email: authenticatedUser.email }
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Invalid Gmail address or password'
        });
    }
});

// POST endpoint to request registration OTP
app.post('/api/request-otp', async (req, res) => {
    const { email, password } = req.body;

    // Validation checks
    if (!email) {
        return res.status(400).json({ success: false, field: 'email', message: 'Gmail address is required' });
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        return res.status(400).json({ success: false, field: 'email', message: 'Must be a valid @gmail.com address' });
    }

    if (!password) {
        return res.status(400).json({ success: false, field: 'password', message: 'Password is required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, field: 'password', message: 'Password must be at least 6 characters' });
    }

    // Check if user is already registered in users.json
    const users = readUsers();
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
        return res.status(409).json({
            success: false,
            field: 'email',
            message: 'Gmail address is already registered'
        });
    }

    // Generate a 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    // Save registration details & code in memory cache
    otpCache.set(email.toLowerCase(), { password, otp, expires });

    // Print code to server console as backup
    console.log('\n==================================================');
    console.log(`[OTP SERVICE] Generated verification code for: ${email}`);
    console.log(`[OTP CODE] => ${otp} (Expires in 5 minutes)`);
    console.log('==================================================\n');

    // Attempt to send email via Nodemailer
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD && process.env.SMTP_EMAIL !== 'your_email@gmail.com') {
        try {
            const mailOptions = {
                from: `"Premium Portal" <${process.env.SMTP_EMAIL}>`,
                to: email,
                subject: 'Your Registration OTP Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                        <h2 style="color: #6366f1; text-align: center;">Verify Your Account</h2>
                        <p style="color: #4b5563; font-size: 16px;">Hello,</p>
                        <p style="color: #4b5563; font-size: 16px;">You are trying to register an account with us. Please use the following 6-digit verification code to complete your registration:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; padding: 15px 30px; font-size: 28px; font-weight: bold; color: #fff; background-color: #6366f1; border-radius: 8px; letter-spacing: 5px;">${otp}</span>
                        </div>
                        <p style="color: #9ca3af; font-size: 14px; text-align: center;">This code will expire in 5 minutes.</p>
                        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;">
                        <p style="color: #9ca3af; font-size: 12px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`[OTP SERVICE] Email successfully sent to ${email}`);
            
            return res.status(200).json({
                success: true,
                message: 'Verification code sent to your Gmail inbox!'
            });
            
        } catch (error) {
            console.error('[OTP SERVICE] Failed to send email:', error.message);
            // Fallback to console simulation if email fails
            return res.status(200).json({
                success: true,
                message: 'Failed to send email. Falling back to console simulation.'
            });
        }
    } else {
        console.log('[OTP SERVICE] SMTP credentials missing or unchanged. Skipping email dispatch.');
        return res.status(200).json({
            success: true,
            message: 'Email dispatch skipped due to missing SMTP credentials in .env. Check server console for OTP.'
        });
    }
});

// POST endpoint to verify OTP and finalize user registration
app.post('/api/register', (req, res) => {
    const { email, otp } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    if (!otp || otp.length !== 6) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit verification code' });
    }

    const emailKey = email.toLowerCase();
    const cachedData = otpCache.get(emailKey);

    if (!cachedData) {
        return res.status(400).json({ success: false, message: 'No active verification request found. Please request a new code.' });
    }

    if (Date.now() > cachedData.expires) {
        otpCache.delete(emailKey);
        return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (cachedData.otp !== otp) {
        return res.status(401).json({ success: false, message: 'Incorrect verification code. Please try again.' });
    }

    const users = readUsers();
    
    if (users.some(u => u.email.toLowerCase() === emailKey)) {
        otpCache.delete(emailKey);
        return res.status(409).json({ success: false, message: 'Gmail address was already registered' });
    }

    users.push({ email: emailKey, password: cachedData.password });
    
    if (saveUsers(users)) {
        otpCache.delete(emailKey);
        return res.status(201).json({ success: true, message: 'Account created successfully!' });
    } else {
        return res.status(500).json({ success: false, message: 'Database write error. Failed to save account.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
