import { Router } from 'express';
import { requireAccessToken } from '../../middleware/requireInternalToken.js';
import { avatarUpload } from '../../middleware/avatar.upload.js';
import { requestOtpPhoneVerifikasi, verifyOtpPhoneVerifikasi, getMyProfileHandler, updateMyProfileHandler, deletePhoneUser, uploadAvatar } from './user.controller.js';
const router = Router();

router.get('/me', requireAccessToken, getMyProfileHandler);
router.put('/me', requireAccessToken, updateMyProfileHandler);
router.patch('/image', requireAccessToken, avatarUpload.single('avatar'), uploadAvatar);
router.post('/requestOtp-phone', requireAccessToken, requestOtpPhoneVerifikasi);
router.post('/verifyOtp-phone', requireAccessToken, verifyOtpPhoneVerifikasi);
router.put('/delete-phone', requireAccessToken, deletePhoneUser);
export default router;
