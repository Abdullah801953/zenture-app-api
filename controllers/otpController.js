import User from '../models/userModel.js';
import generateOTP from '../utils/createToken.js';

export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

   
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = new User({ phone, otp, otpExpiration });
    } else {
      user.otp = otp;
      user.otpExpiration = otpExpiration;
      user.isVerified = false; 
    }

    await user.save();

    
    res.status(200).json({ 
      message: 'OTP sent successfully',
      otp, 
      phone
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const user = await User.findOne({ 
      phone, 
      otp,
      otpExpiration: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    
    user.otp = undefined;
    user.otpExpiration = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({ 
      message: 'OTP verified successfully',
      user: {
        id: user._id,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

export const checkVerification = async (req, res) => {
  try {
    const { phone } = req.params;

    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
      isVerified: user.isVerified 
    });
  } catch (error) {
    console.error('Error checking verification:', error);
    res.status(500).json({ error: 'Failed to check verification status' });
  }
};