import User from '../models/user.model.js';
import PasswordReset from '../models/passwordReset.model.js';
import { sendEmail } from '../config/mailer.config.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Request password reset
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 4-digit code
        const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset code
        await PasswordReset.create({
            user: user._id,
            token: resetCode,
            expiresAt
        });

        // Send email with code
        await sendEmail({
            to: email,
            subject: 'Password Reset Code',
            html: `
                <h1>Password Reset Code</h1>
                <p>Your password reset code is: <strong>${resetCode}</strong></p>
                <p>This code will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.status(200).json({ 
            message: 'Password reset code sent to your email',
            email: email // Send back email for frontend use
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ 
            message: 'Error processing password reset request' 
        });
    }
};

// Verify reset code
export const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find valid reset code
        const passwordReset = await PasswordReset.findOne({
            user: user._id,
            token: code,
            expiresAt: { $gt: new Date() }
        });

        if (!passwordReset) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset code' 
            });
        }

        // Generate a temporary token for password reset
        const tempToken = crypto.randomBytes(32).toString('hex');
        
        // Update the reset record with the temp token
        await PasswordReset.findByIdAndUpdate(passwordReset._id, {
            token: tempToken,
            expiresAt: new Date(Date.now() + 900000) // 15 minutes
        });

        res.status(200).json({ 
            message: 'Reset code verified',
            tempToken,
            userId: user._id
        });

    } catch (error) {
        console.error('Reset code verification error:', error);
        res.status(500).json({ 
            message: 'Error verifying reset code' 
        });
    }
};

// Reset password with temp token
export const resetPassword = async (req, res) => {
    try {
        const { tempToken, newPassword, userId } = req.body;

        // Find valid reset token
        const passwordReset = await PasswordReset.findOne({
            user: userId,
            token: tempToken,
            expiresAt: { $gt: new Date() }
        });

        if (!passwordReset) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword }
        );

        // Delete used reset token
        await PasswordReset.deleteOne({ _id: passwordReset._id });

        res.status(200).json({ 
            message: 'Password successfully reset' 
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            message: 'Error resetting password' 
        });
    }
};