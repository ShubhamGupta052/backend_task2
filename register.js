const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('./userModel');
const router = express.Router();

// Send OTP via email
const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
  });
  await transporter.sendMail({
    to: email,
    subject: 'Verify your account',
    text: `Your OTP is: ${otp}`,
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    const newUser = new User({ username, email, password, otp, otpExpiry });
    await newUser.save();

    // Send OTP to user's email
    await sendEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email. Verify to complete registration.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Account verified. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
