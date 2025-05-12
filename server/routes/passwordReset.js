import express from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/passwordReset.controller.js';

const router = express.Router();

// Route to request a password reset (sends email with reset link)
router.post('/request-reset', requestPasswordReset);

// Route to reset password with token
router.post('/reset', resetPassword);

export default router;