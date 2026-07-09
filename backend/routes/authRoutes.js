import express from 'express';
import {
  register,
  verifyEmail,
  resendOTP,
  login,
  logout,
  getMe,
  refreshTokens,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshTokens);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.put('/changepassword', protect, changePassword);
router.delete('/deleteaccount', protect, deleteAccount);

export default router;
