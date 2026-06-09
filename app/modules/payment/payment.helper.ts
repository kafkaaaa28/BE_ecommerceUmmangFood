import { MIDTRANS_STATUS_MAP } from './payment.contants.js';
import { PaymentStatus, OrderStatus } from '../../../generated/prisma/client.js';
export function resolveStatus(transactionStatus: string, fraudStatus: string) {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'accept' ? PaymentStatus.PAID : PaymentStatus.FAILED;
  }

  return MIDTRANS_STATUS_MAP[transactionStatus as keyof typeof MIDTRANS_STATUS_MAP] ?? PaymentStatus.FAILED;
}

export function mapPaymentStatusToOrderStatus(paymentStatus: PaymentStatus) {
  const map: Partial<Record<PaymentStatus, OrderStatus>> = {
    [PaymentStatus.PAID]: OrderStatus.PROCESSING,
    [PaymentStatus.EXPIRED]: OrderStatus.CANCELLED,
    [PaymentStatus.FAILED]: OrderStatus.CANCELLED,
    [PaymentStatus.REFUNDED]: OrderStatus.CANCELLED,
  };

  return map[paymentStatus] ?? null;
}
