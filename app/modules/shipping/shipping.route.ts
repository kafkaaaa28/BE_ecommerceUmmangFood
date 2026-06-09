import { Router } from 'express';
import { requireAccessToken } from '../../middleware/requireInternalToken.js';
const router = Router();
import { getShippingCost } from './shipping.controller.js';
router.use(requireAccessToken);
router.post('/cost', getShippingCost);

export default router;
