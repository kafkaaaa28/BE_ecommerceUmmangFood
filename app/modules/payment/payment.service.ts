import { snap } from '../../config/midtrans.config.js';
import { buildSnapPayload } from './midtrans.payload.js';
import { resolveStatus } from './payment.helper.js';
import { MIDTRANS_METHOD_MAP, TERMINAL_STATUSES } from './payment.contants.js';
import { PaymentError } from './payment.error.js';
import type { SnapTokenResult, MidtransNotification, PaymentSyncInput } from './payment.types.js';
import { PaymentRepository } from './payment.repository.js';
4;
import { PaymentStatus, OrderStatus, PaymentMethod } from '../../../generated/prisma/client.js';
const EXPIRY_MINUTES = Number(process.env.ORDER_EXPIRY_MINUTES ?? 60);

export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async createSnapToken(orderId: string, buyerId: string): Promise<SnapTokenResult> {
    const order = await this.getOrderOrThrow(orderId, buyerId);
    this.assertOrderPayable(order);

    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
    const payload = buildSnapPayload(order, EXPIRY_MINUTES);
    const snapResult = (await snap.createTransaction(payload)) as {
      token: string;
      redirect_url: string;
    };
    await this.paymentRepo.upsertPaymentWithOrder(orderId, order, snapResult, expiresAt);

    return { snapToken: snapResult.token, checkoutUrl: snapResult.redirect_url };
  }

  async handleWebhookNotification(notification: MidtransNotification) {
    const payment = await this.paymentRepo.findPaymentByGatewayOrderId(notification.order_id);
    if (!payment) {
      throw new PaymentError(`Payment tidak ditemukan untuk order_id: ${notification.order_id}`, 404);
    }

    if (TERMINAL_STATUSES.has(payment.status as PaymentStatus)) {
      return payment;
    }

    const newStatus = resolveStatus(notification.transaction_status, notification.fraud_status ?? '');
    const paidAt = newStatus === PaymentStatus.PAID && notification.settlement_time ? new Date(notification.settlement_time) : null;

    const bankCode = notification.bank ?? notification.va_numbers?.[0]?.bank ?? null;
    const method = notification.payment_type ? (MIDTRANS_METHOD_MAP[notification.payment_type] ?? payment.method) : payment.method;

    return this.syncPaymentStatus(payment.id, payment.order.id, {
      status: newStatus as PaymentStatus,
      method: method as PaymentMethod,
      gatewayTransactionId: notification.transaction_id,
      paymentType: notification.payment_type,
      bankCode: bankCode ?? undefined,
      transactionStatus: notification.transaction_status,
      fraudStatus: notification.fraud_status,
      gatewayStatusCode: notification.status_code,
      gatewayStatusMessage: notification.status_message,
      callbackPayload: notification as unknown as Record<string, unknown>,
      callbackAt: new Date(),
      paidAt,
    });
  }

  async getOrderOrThrow(orderId: string, buyerId: string) {
    const order = await this.paymentRepo.getOrderById(orderId, buyerId);
    if (!order) throw new PaymentError('Order tidak ditemukan', 404);
    return order;
  }

  private assertOrderPayable(order: Awaited<ReturnType<typeof this.getOrderOrThrow>>) {
    if (order.status === OrderStatus.CANCELLED) {
      throw new PaymentError('Order sudah dibatalkan', 400);
    }
    if (order.payment && order.payment.status === PaymentStatus.PAID) {
      throw new PaymentError('Order sudah dibayar', 400);
    }
  }

  async syncPaymentStatus(paymentId: string, orderId: string, data: PaymentSyncInput) {
    const { status, paidAt, ...rest } = data;
    const payment = await this.paymentRepo.syncPaymentStatus(paymentId, orderId, {
      status,
      paidAt,
      ...rest,
    });
    return payment;
  }
}
