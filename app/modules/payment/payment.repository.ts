import { prisma } from '../../config/prisma.js';
import { PaymentGateway, PaymentMethod, PaymentStatus, OrderStatus } from '../../../generated/prisma/client.js';
import type { MidtransNotification } from './payment.types.js';
import { mapPaymentStatusToOrderStatus } from './payment.helper.js';
export class PaymentRepository {
  async getOrderById(orderId: string, buyerId: string) {
    return prisma.order.findFirst({
      where: { id: orderId, buyerId },
      include: {
        payment: true,
        items: true,
      },
    });
  }

  async getPaymentByGatewayOrderId(gatewayOrderId: string) {
    return prisma.payment.findUnique({
      where: { gatewayOrderId },
      include: { order: true },
    });
  }

  async upsertPaymentWithOrder(orderId: string, order: any, snapResult: any, expiresAt: Date) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          gateway: PaymentGateway.MIDTRANS,
          status: PaymentStatus.PENDING,
          amount: order.total,
          method: PaymentMethod.BANK_TRANSFER, // placeholder
          gatewayOrderId: order.code,
          snapToken: snapResult.token,
          checkoutUrl: snapResult.redirect_url,
          expiredAt: expiresAt,
        },
        update: {
          snapToken: snapResult.token,
          checkoutUrl: snapResult.redirect_url,
          expiredAt: expiresAt,
          status: PaymentStatus.PENDING,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          expiresAt,
          status: OrderStatus.PENDING_PAYMENT,
        },
      });

      return payment;
    });
  }

  async findPaymentByGatewayOrderId(gatewayOrderId: string) {
    return prisma.payment.findUnique({
      where: { gatewayOrderId },
      include: { order: true },
    });
  }
  async syncPaymentStatus(paymentId: string, orderId: string, paymentData: any) {
    const { status, paidAt, ...rest } = paymentData;

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt,
          ...rest,
        },
      });

      const orderStatus = mapPaymentStatusToOrderStatus(status);

      if (orderStatus) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: orderStatus,
            ...(paidAt ? { paidAt } : {}),
          },
        });
      }

      return payment;
    });
  }
}

export const paymentRepository = new PaymentRepository();
