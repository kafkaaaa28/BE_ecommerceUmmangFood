import { Router } from 'express';
import { requireAccessToken } from '../../middleware/requireInternalToken.js';
import { midtransWebhook } from './webhook.handler.js';
import { createSnapToken } from './payment.controller.js';
const router = Router();
router.use(requireAccessToken);
router.post('/snap-token', createSnapToken);
router.post('/webhook', midtransWebhook);

export default router;
