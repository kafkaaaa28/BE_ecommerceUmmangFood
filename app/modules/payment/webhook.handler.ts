// src/modules/payment/webhook/webhook.handler.ts

import type { Request, Response } from 'express';
import { verifyMidtransSignature } from './webhook.verifier.js';
import { PaymentError } from './payment.error.js';
import type { MidtransNotification } from './payment.types.js';
import { PaymentService } from './payment.service.js';
import { PaymentRepository } from './payment.repository.js';
const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository);

export async function midtransWebhook(req: Request, res: Response): Promise<void> {
  const payload = req.body as MidtransNotification;

  if (!verifyMidtransSignature(payload)) {
    console.warn('[Webhook] Invalid signature for order_id:', payload.order_id);
    res.status(400).json({ message: 'Invalid signature' });
    return;
  }

  console.info('[Webhook] Notification received:', {
    orderId: payload.order_id,
    transactionStatus: payload.transaction_status,
    fraudStatus: payload.fraud_status,
  });

  try {
    const payment = await paymentService.handleWebhookNotification(payload);

    console.info('[Webhook] Payment synced:', {
      paymentId: payment.id,
      status: payment.status,
    });

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    if (err instanceof PaymentError && err.statusCode === 404) {
      console.warn('[Webhook] Payment not found for order_id:', payload.order_id);
      res.status(200).json({ message: 'OK' });
      return;
    }
    console.error('[Webhook] Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
