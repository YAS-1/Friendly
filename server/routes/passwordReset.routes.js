import express from 'express';
import { 
    requestPasswordReset, 
    verifyResetCode,
    resetPassword 
} from '../controllers/passwordReset.controller.js';

const router = express.Router();

router.post('/request', requestPasswordReset);
router.post('/verify-code', verifyResetCode);
router.post('/reset', resetPassword);

export default router; 