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

        // Generate unique token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token
        await PasswordReset.create({
            user: user._id,
            token,
            expiresAt
        });

        // Create reset link
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

        // Send email
        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
                <a href="${resetLink}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        res.status(200).json({ 
            message: 'Password reset link sent to your email' 
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ 
            message: 'Error processing password reset request' 
        });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Find valid reset token
        const passwordReset = await PasswordReset.findOne({
            token,
            expiresAt: { $gt: new Date() }
        }).populate('user');

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
            passwordReset.user._id,
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