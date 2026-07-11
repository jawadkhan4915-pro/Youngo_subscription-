import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import ReferralHistory from '../models/ReferralHistory.js';
import { asyncHandler } from '../middlewares/error.js';
import sendEmail from '../utils/email.js';
import { uploadImage } from '../config/cloudinary.js';

// Helper: Generate Access Token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'youngo_jwt_access_secret_token_99382!', {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

// Helper: Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'youngo_jwt_refresh_secret_token_77281!', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

// Helper: Send Token response via secure HttpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days matching refresh token
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    accessToken,
    user
  });
};

// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, referralCode } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Generate unique referral code for the new user
  const newReferralCode = `YGO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Find referrer if referral code was provided
  let referrerUser = null;
  if (referralCode) {
    referrerUser = await User.findOne({ referralCode });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    referralCode: newReferralCode,
    referredBy: referrerUser ? referrerUser._id : null,
    verificationOTP: otp,
    verificationOTPExpires: otpExpires
  });

  // Create wallet for user
  const wallet = await Wallet.create({
    user: user._id,
    totalCredits: 20 // Default 20 free credits upon signup
  });

  // If referred, log the referral history link
  if (referrerUser) {
    await ReferralHistory.create({
      referrer: referrerUser._id,
      referee: user._id,
      rewardCredits: 20 // Reward both or just referrer, here reward is 20 credits
    });

    // Credit referrer wallet immediately or upon verification? Let's credit referrer immediately with 20 credits
    const referrerWallet = await Wallet.findOne({ user: referrerUser._id });
    if (referrerWallet) {
      referrerWallet.totalCredits += 20;
      await referrerWallet.save();
    }
  }

  // Send verification email
  const message = `Welcome to Youngo Subscription Sharing Platform! Use this OTP to verify your email address:\n\n${otp}\n\nThis OTP is valid for 10 minutes.`;
  await sendEmail({
    email: user.email,
    subject: 'Youngo Subscription - Email Verification OTP',
    message
  });

  const isMockSmtp = !process.env.SMTP_USER || process.env.SMTP_USER === 'mock_email@gmail.com' || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'mock_password';

  res.status(201).json({
    success: true,
    message: isMockSmtp
      ? `Registration successful! [Dev Bypass: Your OTP is ${otp}]`
      : 'Registration successful! Verification OTP sent to email.',
    email: user.email
  });
});

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+verificationOTP +verificationOTPExpires');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  if (!user.verificationOTP || user.verificationOTP !== otp || user.verificationOTPExpires < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired verification OTP');
  }

  user.isVerified = true;
  user.verificationOTP = undefined;
  user.verificationOTPExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Email is already verified');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationOTP = otp;
  user.verificationOTPExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const message = `Use this OTP to verify your email address:\n\n${otp}\n\nThis OTP is valid for 10 minutes.`;
  await sendEmail({
    email: user.email,
    subject: 'Youngo Subscription - Email Verification OTP',
    message
  });

  res.status(200).json({
    success: true,
    message: 'Verification OTP resent to email.'
  });
});

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isVerified) {
    res.status(403).json({
      success: false,
      isVerified: false,
      message: 'Please verify your email before logging in.'
    });
    return;
  }

  if (user.status === 'Suspended' || user.status === 'Banned') {
    res.status(403);
    throw new Error(`Your account has been ${user.status.toLowerCase()}`);
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout User / Clear Cookies
// @route   POST /api/auth/logout
// @access  Public
export const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const wallet = await Wallet.findOne({ user: req.user.id });

  res.status(200).json({
    success: true,
    user,
    wallet
  });
});

// @desc    Refresh Tokens
// @route   POST /api/auth/refresh
// @access  Public
export const refreshTokens = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token missing');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'youngo_jwt_refresh_secret_token_77281!');
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    if (user.status === 'Suspended' || user.status === 'Banned') {
      res.status(403);
      throw new Error(`Account has been ${user.status.toLowerCase()}`);
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
});

// @desc    Forgot Password Request
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // Generate 6 digit reset OTP
  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = crypto.createHash('sha256').update(resetOTP).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  const message = `You requested a password reset. Use this OTP code to reset your password:\n\n${resetOTP}\n\nThis OTP is valid for 10 minutes.`;
  await sendEmail({
    email: user.email,
    subject: 'Youngo Subscription - Password Reset OTP',
    message
  });

  const isMockSmtp = !process.env.SMTP_USER || process.env.SMTP_USER === 'mock_email@gmail.com' || !process.env.SMTP_PASS || process.env.SMTP_PASS === 'mock_password';

  res.status(200).json({
    success: true,
    message: isMockSmtp
      ? `Password reset OTP sent. [Dev Bypass: Your OTP is ${resetOTP}]`
      : 'Password reset OTP sent to email'
  });
});

// @desc    Reset Password
// @route   POST /api/auth/resetpassword
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    resetPasswordToken: hashedOTP,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset OTP');
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful!'
  });
});

// @desc    Update Profile Details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;

  // Avatar file upload
  if (req.file) {
    const uploadResult = await uploadImage(req.file.buffer, 'youngo_avatars');
    user.avatar = uploadResult.secure_url;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

// @desc    Change Password
// @route   PUT /api/auth/changepassword
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Delete Account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(req.user.id);
  await Wallet.findOneAndDelete({ user: req.user.id });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});
