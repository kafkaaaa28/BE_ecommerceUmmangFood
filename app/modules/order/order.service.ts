import { AppError } from '../error/AppError.js';
import type { OrderRepository } from './order.repository.js';
import type { CreateOrderInput, OrderResponse } from './order.types.js';
import { OrderStatus } from '../../../generated/prisma/client.js';

const EXPIRY_MINUTES = Number(process.env.ORDER_EXPIRY_MINUTES ?? 60);

export class OrderService {
  constructor(private readonly orderRepo: OrderRepository) {}

  async createOrder(buyerId: string, input: CreateOrderInput): Promise<OrderResponse> {
    const address = await this.orderRepo.getAddressById(input.addressId, buyerId);
    if (!address) {
      throw new AppError('ADDRESS_NOT_FOUND', 404, 'Alamat pengiriman tidak ditemukan');
    }

    const variantIds = input.items.map((i) => i.variantId);
    const variants = await this.orderRepo.getVariantsWithInventory(variantIds);

    const variantMap = new Map(variants.map((v) => [v.id, v]));
    for (const item of input.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        throw new AppError('VARIANT_NOT_FOUND', 404, `Varian ${item.variantId} tidak ditemukan atau tidak aktif`);
      }
      if (variant.product.status !== 'ACTIVE') {
        throw new AppError('PRODUCT_INACTIVE', 400, `Produk ${variant.product.name} tidak aktif`);
      }
      const available = (variant.inventory?.onHand ?? 0) - (variant.inventory?.reserved ?? 0);
      if (item.quantity > available) {
        throw new AppError('INSUFFICIENT_STOCK', 400, `Stok ${variant.variantName} tidak mencukupi. Tersedia: ${available}`);
      }
    }

    let subtotal = 0;
    let totalWeightGram = 0;
    const orderItems = input.items.map((item) => {
      const variant = variantMap.get(item.variantId)!;
      const unitPrice = Number(variant.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      totalWeightGram += (variant.weightGram ?? 0) * item.quantity;
      return {
        variantId: item.variantId,
        qty: item.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const total = subtotal + input.shippingFee;
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
    const code = await this.orderRepo.getNextOrderCode();

    const order = await this.orderRepo.createOrder({
      buyerId,
      code,
      namaPenerima: address.recipientName,
      phone: address.phone,
      jalan: `${address.jalan}${address.detail ? `, ${address.detail}` : ''}`,
      kota: address.kota,
      provinsi: address.provinsi,
      kodePos: address.kodePos,
      shipDestinationId: address.origin ?? null,
      shipDestinationLabel: address.originLabel ?? null,
      shipCourierCode: input.courierCode,
      shipServiceCode: input.serviceCode,
      shipEtd: input.shippingEtd,
      shipWeightGram: totalWeightGram,
      subtotal,
      shippingFee: input.shippingFee,
      total,
      notes: input.notes ?? null,
      expiresAt,
      items: orderItems,
    });

    return this.toOrderResponse(order);
  }

  async getOrder(orderId: string, buyerId: string): Promise<OrderResponse> {
    const order = await this.orderRepo.findById(orderId, buyerId);
    if (!order) {
      throw new AppError('ORDER_NOT_FOUND', 404, 'Order tidak ditemukan');
    }
    return this.toOrderResponse(order);
  }

  async getSellerOrder(orderId: string, sellerId: string): Promise<OrderResponse> {
    const order = await this.orderRepo.findBySellerId(orderId, sellerId);
    if (!order) {
      throw new AppError('ORDER_NOT_FOUND', 404, 'Order tidak ditemukan');
    }
    return this.toOrderResponse(order);
  }

  async updateOrderStatus(orderId: string, sellerId: string, newStatus: OrderStatus): Promise<OrderResponse> {
    const order = await this.orderRepo.findBySellerId(orderId, sellerId);
    if (!order) {
      throw new AppError('ORDER_NOT_FOUND', 404, 'Order tidak ditemukan');
    }

    const allowed: Record<string, OrderStatus[]> = {
      PROCESSING: [OrderStatus.SHIPPED],
      SHIPPED: [OrderStatus.COMPLETED],
    };

    const transitions = allowed[order.status] ?? [];
    if (!transitions.includes(newStatus)) {
      throw new AppError(
        'INVALID_STATUS_TRANSITION',
        400,
        `Tidak bisa mengubah status dari ${order.status} ke ${newStatus}`,
      );
    }

    const updated = await this.orderRepo.updateStatus(orderId, newStatus);
    return this.toOrderResponse(updated);
  }

  async listMyOrders(buyerId: string, status?: string, page = 1, limit = 10, search?: string) {
    return this.orderRepo.findByBuyerId(buyerId, status, page, limit, search);
  }

  async listSellerOrders(sellerId: string, status?: string, page = 1, limit = 10, search?: string) {
    return this.orderRepo.findBySeller(sellerId, status, page, limit, search);
  }

  private toOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      code: order.code,
      status: order.status as OrderStatus,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      expiresAt: order.expiresAt,
      createdAt: order.createdAt,
      paidAt: order.paidAt ?? null,
      namaPenerima: order.namaPenerima,
      phone: order.phone,
      jalan: order.jalan,
      kota: order.kota,
      provinsi: order.provinsi,
      kodePos: order.kodePos,
      shipCourierCode: order.shipCourierCode,
      shipServiceCode: order.shipServiceCode,
      shipEtd: order.shipEtd,
      notes: order.notes,
      buyer: order.buyer
        ? { id: order.buyer.id, name: order.buyer.name, email: order.buyer.email }
        : null,
      items: order.items.map((item: any) => ({
        id: item.id,
        variantId: item.variant.id,
        variantName: item.variant.variantName,
        productName: item.variant.product.name,
        quantity: item.qty,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        imageUrl: item.variant.imageUrl,
      })),
      payment: order.payment
        ? {
            snapToken: order.payment.snapToken,
            checkoutUrl: order.payment.checkoutUrl,
            status: order.payment.status,
          }
        : null,
    };
  }
}
