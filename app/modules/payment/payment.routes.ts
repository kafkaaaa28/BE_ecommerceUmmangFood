import { Router } from "express";
import { requireAccessToken } from "../../middleware/requireInternalToken.js";
import { midtransWebhook } from "./webhook.handler.js";
import { createSnapToken } from "./payment.controller.js";
const router = Router();
router.post("/snap-token", requireAccessToken, createSnapToken);
router.post("/webhook", midtransWebhook);

export default router;
