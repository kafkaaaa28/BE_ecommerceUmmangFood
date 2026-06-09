import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../../generated/prisma/client.js', () => {
  const OrderStatus = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID: 'PAID',
    PROCESSING: 'PROCESSING',
    SHIPPED: 'SHIPPED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
  };
  return { OrderStatus };
});

vi.mock('../../../config/prisma.js', () => ({
  prisma: {},
}));

import { OrderService } from '../order.service.js';
import { AppError } from '../../error/AppError.js';

const mockAddress = {
  id: 'addr-1',
  userId: 'buyer-1',
  recipientName: 'Budi',
  phone: '08123456789',
  jalan: 'Jl. Merdeka No. 1',
  detail: 'RT 01 RW 02',
  kota: 'Jakarta',
  provinsi: 'DKI Jakarta',
  kodePos: '12345',
  origin: null,
  originLabel: null,
};

const mockVariant = {
  id: 'variant-1',
  variantName: 'Varian A',
  price: 50000,
  weightGram: 250,
  isActive: true,
  inventory: { onHand: 100, reserved: 10 },
  product: { id: 'product-1', name: 'Produk A', status: 'ACTIVE' },
};

const mockCreatedOrder = {
  id: 'order-1',
  code: 'ORD-20250609-0001',
  status: 'PENDING_PAYMENT',
  subtotal: 100000,
  shippingFee: 15000,
  total: 115000,
  expiresAt: new Date(),
  createdAt: new Date(),
  paidAt: null,
  namaPenerima: 'Budi',
  phone: '08123456789',
  jalan: 'Jl. Merdeka No. 1',
  kota: 'Jakarta',
  provinsi: 'DKI Jakarta',
  kodePos: '12345',
  shipCourierCode: 'jne',
  shipServiceCode: 'REG',
  shipEtd: '1-2 hari',
  notes: 'Tolong dibungkus rapih',
  buyer: { id: 'buyer-1', name: 'Budi', email: 'budi@test.com' },
  items: [
    {
      id: 'item-1',
      qty: 2,
      unitPrice: 50000,
      lineTotal: 100000,
      variant: {
        id: 'variant-1',
        variantName: 'Varian A',
        imageUrl: null,
        product: { id: 'product-1', name: 'Produk A' },
      },
    },
  ],
  payment: null,
};

describe('OrderService', () => {
  let orderService: OrderService;
  let mockRepo: {
    getAddressById: ReturnType<typeof vi.fn>;
    getVariantsWithInventory: ReturnType<typeof vi.fn>;
    getNextOrderCode: ReturnType<typeof vi.fn>;
    createOrder: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByBuyerId: ReturnType<typeof vi.fn>;
    findBySeller: ReturnType<typeof vi.fn>;
    findBySellerId: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  const validInput = {
    items: [{ variantId: 'variant-1', quantity: 2 }],
    addressId: 'addr-1',
    courierCode: 'jne',
    serviceCode: 'REG',
    serviceName: 'Reguler',
    shippingFee: 15000,
    shippingEtd: '1-2 hari',
    notes: 'Tolong dibungkus rapih',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      getAddressById: vi.fn(),
      getVariantsWithInventory: vi.fn(),
      getNextOrderCode: vi.fn(),
      createOrder: vi.fn(),
      findById: vi.fn(),
      findByBuyerId: vi.fn(),
      findBySeller: vi.fn(),
      findBySellerId: vi.fn(),
      updateStatus: vi.fn(),
    };
    orderService = new OrderService(mockRepo as any);
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      mockRepo.getAddressById.mockResolvedValue(mockAddress);
      mockRepo.getVariantsWithInventory.mockResolvedValue([mockVariant]);
      mockRepo.getNextOrderCode.mockResolvedValue('ORD-20250609-0001');
      mockRepo.createOrder.mockResolvedValue(mockCreatedOrder);

      const result = await orderService.createOrder('buyer-1', validInput);

      expect(result.code).toBe('ORD-20250609-0001');
      expect(result.total).toBe(115000);
      expect(mockRepo.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          buyerId: 'buyer-1',
          code: 'ORD-20250609-0001',
          subtotal: 100000,
          shippingFee: 15000,
          total: 115000,
          namaPenerima: 'Budi',
          shipCourierCode: 'jne',
          shipServiceCode: 'REG',
        }),
      );
    });

    it('should throw AppError when address not found', async () => {
      mockRepo.getAddressById.mockResolvedValue(null);

      await expect(orderService.createOrder('buyer-1', validInput)).rejects.toThrow(AppError);
      await expect(orderService.createOrder('buyer-1', validInput)).rejects.toMatchObject({
        code: 'ADDRESS_NOT_FOUND',
        status: 404,
      });
    });

    it('should throw AppError when variant not found', async () => {
      mockRepo.getAddressById.mockResolvedValue(mockAddress);
      mockRepo.getVariantsWithInventory.mockResolvedValue([]);

      await expect(orderService.createOrder('buyer-1', validInput)).rejects.toThrow(AppError);
      await expect(orderService.createOrder('buyer-1', validInput)).rejects.toMatchObject({
        code: 'VARIANT_NOT_FOUND',
        status: 404,
      });
    });

    it('should throw AppError when product is inactive', async () => {
      mockRepo.getAddressById.mockResolvedValue(mockAddress);
      mockRepo.getVariantsWithInventory.mockResolvedValue([
        { ...mockVariant, product: { ...mockVariant.product, status: 'INACTIVE' } },
      ]);

      await expect(orderService.createOrder('buyer-1', validInput)).rejects.toThrow(AppError);
      await expect(orderService.createOrder('buyer-1', validInput)).rejects.toMatchObject({
        code: 'PRODUCT_INACTIVE',
        status: 400,
      });
    });

    it('should throw AppError when stock is insufficient', async () => {
      mockRepo.getAddressById.mockResolvedValue(mockAddress);
      mockRepo.getVariantsWithInventory.mockResolvedValue([
        { ...mockVariant, inventory: { onHand: 5, reserved: 4 } },
      ]);

      await expect(
        orderService.createOrder('buyer-1', {
          ...validInput,
          items: [{ variantId: 'variant-1', quantity: 10 }],
        }),
      ).rejects.toThrow(AppError);
      await expect(
        orderService.createOrder('buyer-1', {
          ...validInput,
          items: [{ variantId: 'variant-1', quantity: 10 }],
        }),
      ).rejects.toMatchObject({
        code: 'INSUFFICIENT_STOCK',
        status: 400,
      });
    });

    it('should calculate total with shipping fee', async () => {
      mockRepo.getAddressById.mockResolvedValue(mockAddress);
      mockRepo.getVariantsWithInventory.mockResolvedValue([mockVariant]);
      mockRepo.getNextOrderCode.mockResolvedValue('ORD-20250609-0002');
      mockRepo.createOrder.mockResolvedValue(mockCreatedOrder);

      const result = await orderService.createOrder('buyer-1', validInput);

      expect(result.subtotal).toBe(100000);
      expect(result.shippingFee).toBe(15000);
      expect(result.total).toBe(115000);
    });

    it('should calculate total weight gram', async () => {
      mockRepo.getAddressById.mockResolvedValue(mockAddress);
      mockRepo.getVariantsWithInventory.mockResolvedValue([mockVariant]);
      mockRepo.getNextOrderCode.mockResolvedValue('ORD-20250609-0003');

      let capturedData: any;
      mockRepo.createOrder.mockImplementation((data: any) => {
        capturedData = data;
        return mockCreatedOrder;
      });

      await orderService.createOrder('buyer-1', {
        ...validInput,
        items: [{ variantId: 'variant-1', quantity: 3 }],
      });

      expect(capturedData.shipWeightGram).toBe(750);
    });
  });

  describe('getOrder', () => {
    it('should return order when found', async () => {
      mockRepo.findById.mockResolvedValue(mockCreatedOrder);

      const result = await orderService.getOrder('order-1', 'buyer-1');

      expect(result.id).toBe('order-1');
      expect(mockRepo.findById).toHaveBeenCalledWith('order-1', 'buyer-1');
    });

    it('should throw AppError when order not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(orderService.getOrder('order-x', 'buyer-1')).rejects.toThrow(AppError);
      await expect(orderService.getOrder('order-x', 'buyer-1')).rejects.toMatchObject({
        code: 'ORDER_NOT_FOUND',
        status: 404,
      });
    });
  });

  describe('getSellerOrder', () => {
    it('should return order for seller when found', async () => {
      mockRepo.findBySellerId.mockResolvedValue(mockCreatedOrder);

      const result = await orderService.getSellerOrder('order-1', 'seller-1');

      expect(result.id).toBe('order-1');
      expect(mockRepo.findBySellerId).toHaveBeenCalledWith('order-1', 'seller-1');
    });

    it('should throw AppError when order not found for seller', async () => {
      mockRepo.findBySellerId.mockResolvedValue(null);

      await expect(orderService.getSellerOrder('order-x', 'seller-1')).rejects.toThrow(AppError);
      await expect(orderService.getSellerOrder('order-x', 'seller-1')).rejects.toMatchObject({
        code: 'ORDER_NOT_FOUND',
        status: 404,
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update PROCESSING to SHIPPED', async () => {
      const processingOrder = { ...mockCreatedOrder, status: 'PROCESSING' };
      const shippedOrder = { ...mockCreatedOrder, status: 'SHIPPED' };
      mockRepo.findBySellerId.mockResolvedValue(processingOrder);
      mockRepo.updateStatus.mockResolvedValue(shippedOrder);

      const result = await orderService.updateOrderStatus('order-1', 'seller-1', 'SHIPPED' as any);

      expect(result.status).toBe('SHIPPED');
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('order-1', 'SHIPPED');
    });

    it('should update SHIPPED to COMPLETED', async () => {
      const shippedOrder = { ...mockCreatedOrder, status: 'SHIPPED' };
      const completedOrder = { ...mockCreatedOrder, status: 'COMPLETED' };
      mockRepo.findBySellerId.mockResolvedValue(shippedOrder);
      mockRepo.updateStatus.mockResolvedValue(completedOrder);

      const result = await orderService.updateOrderStatus('order-1', 'seller-1', 'COMPLETED' as any);

      expect(result.status).toBe('COMPLETED');
      expect(mockRepo.updateStatus).toHaveBeenCalledWith('order-1', 'COMPLETED');
    });

    it('should throw AppError on invalid transition from PROCESSING to COMPLETED', async () => {
      const processingOrder = { ...mockCreatedOrder, status: 'PROCESSING' };
      mockRepo.findBySellerId.mockResolvedValue(processingOrder);

      await expect(
        orderService.updateOrderStatus('order-1', 'seller-1', 'COMPLETED' as any),
      ).rejects.toThrow(AppError);
      await expect(
        orderService.updateOrderStatus('order-1', 'seller-1', 'COMPLETED' as any),
      ).rejects.toMatchObject({
        code: 'INVALID_STATUS_TRANSITION',
        status: 400,
      });
    });

    it('should throw AppError on invalid transition from PENDING_PAYMENT to SHIPPED', async () => {
      const pendingOrder = { ...mockCreatedOrder, status: 'PENDING_PAYMENT' };
      mockRepo.findBySellerId.mockResolvedValue(pendingOrder);

      await expect(
        orderService.updateOrderStatus('order-1', 'seller-1', 'SHIPPED' as any),
      ).rejects.toThrow(AppError);
      await expect(
        orderService.updateOrderStatus('order-1', 'seller-1', 'SHIPPED' as any),
      ).rejects.toMatchObject({
        code: 'INVALID_STATUS_TRANSITION',
        status: 400,
      });
    });

    it('should throw AppError when order not found', async () => {
      mockRepo.findBySellerId.mockResolvedValue(null);

      await expect(
        orderService.updateOrderStatus('order-x', 'seller-1', 'SHIPPED' as any),
      ).rejects.toThrow(AppError);
      await expect(
        orderService.updateOrderStatus('order-x', 'seller-1', 'SHIPPED' as any),
      ).rejects.toMatchObject({
        code: 'ORDER_NOT_FOUND',
        status: 404,
      });
    });
  });
});
