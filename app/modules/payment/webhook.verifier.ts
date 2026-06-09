import crypto from 'crypto';
import type { MidtransNotification } from './payment.types.js';

export function verifyMidtransSignature(payload: MidtransNotification): boolean {
  const { order_id, status_code, gross_amount, signature_key } = payload;

  if (!order_id || !status_code || !gross_amount || !signature_key) return false;

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY is not configured');

  const raw = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature_key, 'utf8'));
  } catch {
    return false;
  }
}
