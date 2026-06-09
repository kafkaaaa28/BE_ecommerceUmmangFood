import { PaymentMethod, PaymentStatus } from '../../../generated/prisma/client.js';

export interface MidtransNotification {
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount: string;
  status_code: string;
  status_message?: string;
  signature_key: string;
  bank?: string;
  va_numbers?: Array<{ bank: string; va_number: string }>;
  settlement_time?: string;
}

export interface SnapTokenResult {
  snapToken: string;
  checkoutUrl: string;
}

export interface SnapTokenCacheEntry {
  snapToken: string;
  checkoutUrl: string;
  expiresAt: Date;
}

export interface PaymentSyncInput {
  status: PaymentStatus;
  method?: PaymentMethod;
  gatewayTransactionId?: string;
  paymentType?: string;
  bankCode?: string;
  transactionStatus?: string;
  fraudStatus?: string;
  gatewayStatusCode?: string;
  gatewayStatusMessage?: string;
  callbackPayload?: Record<string, unknown>;
  callbackAt?: Date;
  paidAt?: Date | null;
}
