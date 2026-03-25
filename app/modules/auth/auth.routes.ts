import { Router } from 'express';
import { requestOtpLoginHandler, verifyOtpLoginHandler, refreshTokenHandler, logoutHandler } from './auth.controller.js';
import { requireAccessToken } from '../../middleware/requireInternalToken.js';
const router = Router();

router.post('/request-otp', requestOtpLoginHandler);
router.post('/verify-otp', verifyOtpLoginHandler);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', requireAccessToken, logoutHandler);
export default router;
