import { Router } from 'express';
import { requireAccessToken } from '../../middleware/requireInternalToken.js';
import { avatarUpload } from '../../middleware/avatar.upload.js';
import { requestOtpPhoneVerifikasi, verifyOtpPhoneVerifikasi, getMyProfileHandler, updateMyProfileHandler, deletePhoneUser, uploadAvatar, getUserByIdHandler } from './user.controller.js';
const router = Router();

router.use(requireAccessToken);
router.get('/me/:id', getUserByIdHandler);
router.get('/me', getMyProfileHandler);
router.put('/me', updateMyProfileHandler);
router.patch('/image', avatarUpload.single('avatar'), uploadAvatar);
router.post('/requestOtp-phone', requestOtpPhoneVerifikasi);
router.post('/verifyOtp-phone', verifyOtpPhoneVerifikasi);
router.put('/delete-phone', deletePhoneUser);
export default router;
