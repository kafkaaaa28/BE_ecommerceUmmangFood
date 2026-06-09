import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../generated/prisma/client.js', () => {
  const PaymentStatus = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    EXPIRED: 'EXPIRED',
    REFUNDED: 'REFUNDED',
  };
  const OrderStatus = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PROCESSING: 'PROCESSING',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
  };
  const PaymentMethod = {
    BANK_TRANSFER: 'BANK_TRANSFER',
    E_WALLET: 'E_WALLET',
    QRIS: 'QRIS',
  };
  const PaymentGateway = { MIDTRANS: 'MIDTRANS' };
  return { PaymentStatus, OrderStatus, PaymentMethod, PaymentGateway };
});

vi.mock('../../../config/prisma.js', () => ({
  prisma: {},
}));

vi.mock('../../../config/midtrans.config.js', () => ({
  snap: {
    createTransaction: vi.fn(),
  },
}));

vi.mock('../midtrans.payload.js', () => ({
  buildSnapPayload: vi.fn(() => ({
    transaction_details: { order_id: 'ORD-20250609-0001', gross_amount: 150000 },
  })),
}));

vi.mock('../payment.helper.js', () => ({
  resolveStatus: vi.fn(),
  mapPaymentStatusToOrderStatus: vi.fn(),
}));

import { PaymentService } from '../payment.service.js';
import { PaymentError } from '../payment.error.js';
import { PaymentStatus, OrderStatus, PaymentMethod } from '../../../../generated/prisma/client.js';
import { snap } from '../../../config/midtrans.config.js';
import { resolveStatus } from '../payment.helper.js';

const mockSnapResult = {
  token: 'snap-token-123',
  redirect_url: 'https://app.sandbox.midtrans.com/snap/v2/checkout-url',
};

const mockOrder = {
  id: 'order-1',
  code: 'ORD-20250609-0001',
  status: OrderStatus.PENDING_PAYMENT,
  total: 150000,
  buyerId: 'buyer-1',
  items: [],
  payment: null,
};

const mockPayment = {
  id: 'payment-1',
  orderId: 'order-1',
  gateway: 'MIDTRANS',
  status: PaymentStatus.PENDING,
  amount: 150000,
  method: PaymentMethod.BANK_TRANSFER,
  gatewayOrderId: 'ORD-20250609-0001',
  snapToken: 'snap-token-123',
  checkoutUrl: 'https://app.sandbox.midtrans.com/snap/v2/checkout-url',
  expiredAt: new Date(),
  order: mockOrder,
};

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockRepo: {
    getOrderById: ReturnType<typeof vi.fn>;
    upsertPaymentWithOrder: ReturnType<typeof vi.fn>;
    findPaymentByGatewayOrderId: ReturnType<typeof vi.fn>;
    syncPaymentStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      getOrderById: vi.fn(),
      upsertPaymentWithOrder: vi.fn(),
      findPaymentByGatewayOrderId: vi.fn(),
      syncPaymentStatus: vi.fn(),
    };
    paymentService = new PaymentService(mockRepo as any);
  });

  describe('createSnapToken', () => {
    it('should return snap token for valid payable order', async () => {
      mockRepo.getOrderById.mockResolvedValue(mockOrder);
      (snap.createTransaction as ReturnType<typeof vi.fn>).mockResolvedValue(mockSnapResult);
      mockRepo.upsertPaymentWithOrder.mockResolvedValue(mockPayment);

      const result = await paymentService.createSnapToken('order-1', 'buyer-1');

      expect(result).toEqual({
        snapToken: 'snap-token-123',
        checkoutUrl: 'https://app.sandbox.midtrans.com/snap/v2/checkout-url',
      });
      expect(mockRepo.getOrderById).toHaveBeenCalledWith('order-1', 'buyer-1');
      expect(snap.createTransaction).toHaveBeenCalledOnce();
      expect(mockRepo.upsertPaymentWithOrder).toHaveBeenCalledOnce();
    });

    it('should throw PaymentError when order not found', async () => {
      mockRepo.getOrderById.mockResolvedValue(null);

      await expect(paymentService.createSnapToken('order-x', 'buyer-1')).rejects.toThrow(PaymentError);
      await expect(paymentService.createSnapToken('order-x', 'buyer-1')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Order tidak ditemukan',
      });
    });

    it('should throw PaymentError when order is cancelled', async () => {
      mockRepo.getOrderById.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED });

      await expect(paymentService.createSnapToken('order-1', 'buyer-1')).rejects.toThrow(PaymentError);
      await expect(paymentService.createSnapToken('order-1', 'buyer-1')).rejects.toMatchObject({
        statusCode: 400,
        message: 'Order sudah dibatalkan',
      });
    });

    it('should throw PaymentError when order is already paid', async () => {
      mockRepo.getOrderById.mockResolvedValue({
        ...mockOrder,
        payment: { ...mockPayment, status: PaymentStatus.PAID },
      });

      await expect(paymentService.createSnapToken('order-1', 'buyer-1')).rejects.toThrow(PaymentError);
      await expect(paymentService.createSnapToken('order-1', 'buyer-1')).rejects.toMatchObject({
        statusCode: 400,
        message: 'Order sudah dibayar',
      });
    });
  });

  describe('handleWebhookNotification', () => {
    it('should sync payment status on settlement notification', async () => {
      const notification = {
        order_id: 'ORD-20250609-0001',
        transaction_status: 'settlement',
        fraud_status: '',
        transaction_id: 'trx-123',
        payment_type: 'bank_transfer',
        bank: 'bca',
        settlement_time: '2025-06-09T10:00:00Z',
        status_code: '200',
        status_message: 'Success',
        va_numbers: [{ bank: 'bca', va_number: '12345' }],
      };

      mockRepo.findPaymentByGatewayOrderId.mockResolvedValue(mockPayment);
      (resolveStatus as ReturnType<typeof vi.fn>).mockReturnValue(PaymentStatus.PAID);
      mockRepo.syncPaymentStatus.mockResolvedValue({ ...mockPayment, status: PaymentStatus.PAID });

      const result = await paymentService.handleWebhookNotification(notification as any);

      expect(result.status).toBe(PaymentStatus.PAID);
      expect(mockRepo.findPaymentByGatewayOrderId).toHaveBeenCalledWith('ORD-20250609-0001');
      expect(mockRepo.syncPaymentStatus).toHaveBeenCalledWith(
        'payment-1',
        'order-1',
        expect.objectContaining({
          status: PaymentStatus.PAID,
          method: PaymentMethod.BANK_TRANSFER,
          gatewayTransactionId: 'trx-123',
          paymentType: 'bank_transfer',
          bankCode: 'bca',
          paidAt: expect.any(Date),
        }),
      );
    });

    it('should throw PaymentError when payment not found', async () => {
      mockRepo.findPaymentByGatewayOrderId.mockResolvedValue(null);

      await expect(
        paymentService.handleWebhookNotification({ order_id: 'ORD-UNKNOWN' } as any),
      ).rejects.toThrow(PaymentError);
      await expect(
        paymentService.handleWebhookNotification({ order_id: 'ORD-UNKNOWN' } as any),
      ).rejects.toMatchObject({ statusCode: 404, message: expect.stringContaining('tidak ditemukan') });
    });

    it('should skip sync when payment already in terminal status', async () => {
      mockRepo.findPaymentByGatewayOrderId.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PAID,
      });

      const result = await paymentService.handleWebhookNotification({
        order_id: 'ORD-20250609-0001',
        transaction_status: 'capture',
      } as any);

      expect(result.status).toBe(PaymentStatus.PAID);
      expect(mockRepo.syncPaymentStatus).not.toHaveBeenCalled();
    });

    it('should map capture+accept to PAID', async () => {
      const notification = {
        order_id: 'ORD-20250609-0001',
        transaction_status: 'capture',
        fraud_status: 'accept',
        transaction_id: 'trx-456',
        payment_type: 'credit_card',
        status_code: '200',
        status_message: 'Success',
      };

      mockRepo.findPaymentByGatewayOrderId.mockResolvedValue(mockPayment);
      (resolveStatus as ReturnType<typeof vi.fn>).mockReturnValue(PaymentStatus.PAID);
      mockRepo.syncPaymentStatus.mockResolvedValue({ ...mockPayment, status: PaymentStatus.PAID });

      const result = await paymentService.handleWebhookNotification(notification as any);

      expect(result.status).toBe(PaymentStatus.PAID);
      expect(resolveStatus).toHaveBeenCalledWith('capture', 'accept');
    });
  });
});
