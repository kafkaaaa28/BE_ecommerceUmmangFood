import { OrderStatus, PaymentStatus, PaymentMethod } from '../../../generated/prisma/client.js';

export const MIDTRANS_STATUS_MAP: Record<string, PaymentStatus> = {
  capture: PaymentStatus.PAID,
  settlement: PaymentStatus.PAID,
  pending: PaymentStatus.PENDING,
  deny: PaymentStatus.FAILED,
  cancel: PaymentStatus.REFUNDED,
  expire: PaymentStatus.EXPIRED,
  refund: PaymentStatus.REFUNDED,
  partial_refund: PaymentStatus.REFUNDED,
  failure: PaymentStatus.FAILED,
} as const;

export const MIDTRANS_METHOD_MAP: Record<string, PaymentMethod> = {
  bank_transfer: PaymentMethod.BANK_TRANSFER,
  echannel: PaymentMethod.BANK_TRANSFER,
  gopay: PaymentMethod.E_WALLET,
  shopeepay: PaymentMethod.E_WALLET,
  qris: PaymentMethod.QRIS,
} as const;

export const TERMINAL_STATUSES = new Set<PaymentStatus>([PaymentStatus.PAID, PaymentStatus.FAILED, PaymentStatus.REFUNDED, PaymentStatus.EXPIRED]);

export const PAYMENT_TO_ORDER_STATUS: Partial<Record<PaymentStatus, OrderStatus>> = {
  [PaymentStatus.PAID]: OrderStatus.PROCESSING,
  [PaymentStatus.REFUNDED]: OrderStatus.CANCELLED,
  [PaymentStatus.EXPIRED]: OrderStatus.EXPIRED,
} as const;
