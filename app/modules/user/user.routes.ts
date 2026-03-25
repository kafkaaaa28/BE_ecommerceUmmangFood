import { Router } from 'express';
import { requireAccessToken } from '../../middleware/requireInternalToken.js';
import { requestOtpPhoneVerifikasi, verifyOtpPhoneVerifikasi, getMyProfileHandler, updateMyProfileHandler } from './user.controller.js';
const router = Router();

router.get('/me', requireAccessToken, getMyProfileHandler);
router.put('/me', requireAccessToken, updateMyProfileHandler);
router.post('/requestOtp-phone', requireAccessToken, requestOtpPhoneVerifikasi);
router.post('/verifyOtp-phone', requireAccessToken, verifyOtpPhoneVerifikasi);
export default router;
