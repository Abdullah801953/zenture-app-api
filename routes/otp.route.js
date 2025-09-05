import express from 'express';
import { sendOTP, verifyOTP, checkVerification } from '../controllers/otpController.js';

const otpRouter = express.Router();

otpRouter.post('/send-otp', sendOTP);
otpRouter.post('/verify-otp', verifyOTP);
otpRouter.get('/check-verification/:phone', checkVerification);

export default otpRouter;