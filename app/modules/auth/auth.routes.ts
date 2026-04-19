import { Router } from 'express';
import { requestOtpLoginHandler, verifyOtpLoginHandler, refreshTokenHandler, logoutHandler, googleExchangeHandler } from './auth.controller.js';
import { requireAccessToken, requireInternalToken } from '../../middleware/requireInternalToken.js';
const router = Router();

router.post('/request-otp', requestOtpLoginHandler);
router.post('/verify-otp', verifyOtpLoginHandler);
router.post('/google/exchange', requireInternalToken, googleExchangeHandler);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', requireAccessToken, logoutHandler);
export default router;
