import { prisma } from '../../config/prisma.js';
import type { Prisma } from '../../../generated/prisma/client.js';
import { OrderStatus } from '../../../generated/prisma/client.js';

export class OrderRepository {
  async findById(orderId: string, buyerId?: string) {
    return prisma.order.findFirst({
      where: { id: orderId, ...(buyerId ? { buyerId } : {}) },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            variant: {
              select: {
                id: true,
                variantName: true,
                product: { select: { id: true, name: true } },
                imageUrl: true,
              },
            },
          },
        },
        payment: {
          select: { snapToken: true, checkoutUrl: true, status: true },
        },
      },
    });
  }

  async findBySellerId(orderId: string, sellerId: string) {
    return prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            variant: {
              product: { createdBy: sellerId },
            },
          },
        },
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            variant: {
              select: {
                id: true,
                variantName: true,
                product: { select: { id: true, name: true } },
                imageUrl: true,
              },
            },
          },
        },
        payment: {
          select: { snapToken: true, checkoutUrl: true, status: true },
        },
      },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            variant: {
              select: {
                id: true,
                variantName: true,
                product: { select: { id: true, name: true } },
                imageUrl: true,
              },
            },
          },
        },
        payment: {
          select: { snapToken: true, checkoutUrl: true, status: true },
        },
      },
    });
  }

  async findByBuyerId(buyerId: string, status?: string, page = 1, limit = 10, search?: string) {
    const where: Prisma.OrderWhereInput = { buyerId };
    if (status) {
      where.status = status as OrderStatus;
    }
    if (search) {
      where.code = { contains: search };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          _count: { select: { items: true } },
          payment: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySeller(sellerId: string, status?: string, page = 1, limit = 10, search?: string) {
    const where: Prisma.OrderWhereInput = {
      items: {
        some: {
          variant: {
            product: {
              createdBy: sellerId,
            },
          },
        },
      },
    };
    if (status) {
      where.status = status as OrderStatus;
    }
    if (search) {
      where.code = { contains: search };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
          payment: { select: { status: true } },
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  variantName: true,
                  product: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createOrder(data: {
    buyerId: string;
    code: string;
    namaPenerima: string;
    phone: string;
    jalan: string;
    kota: string | null;
    provinsi: string | null;
    kodePos: string | null;
    shipDestinationId: number | null;
    shipDestinationLabel: string | null;
    shipCourierCode: string;
    shipServiceCode: string;
    shipEtd: string;
    shipWeightGram: number;
    subtotal: number;
    shippingFee: number;
    total: number;
    notes: string | null;
    expiresAt: Date;
    items: Array<{
      variantId: string;
      qty: number;
      unitPrice: number;
      lineTotal: number;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          buyerId: data.buyerId,
          code: data.code,
          status: OrderStatus.PENDING_PAYMENT,
          namaPenerima: data.namaPenerima,
          phone: data.phone,
          jalan: data.jalan,
          kota: data.kota,
          provinsi: data.provinsi,
          kodePos: data.kodePos,
          shipDestinationId: data.shipDestinationId,
          shipDestinationLabel: data.shipDestinationLabel,
          shipCourierCode: data.shipCourierCode,
          shipServiceCode: data.shipServiceCode,
          shipEtd: data.shipEtd,
          shipWeightGram: data.shipWeightGram,
          subtotal: data.subtotal,
          shippingFee: data.shippingFee,
          total: data.total,
          notes: data.notes,
          expiresAt: data.expiresAt,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              qty: item.qty,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  variantName: true,
                  product: { select: { id: true, name: true } },
                  imageUrl: true,
                },
              },
            },
          },
          payment: {
            select: { snapToken: true, checkoutUrl: true, status: true },
          },
        },
      });

      for (const item of data.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            reserved: { increment: item.qty },
          },
        });
      }

      return order;
    });
  }

  async getVariantsWithInventory(variantIds: string[]) {
    return prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      include: {
        inventory: true,
        product: { select: { id: true, name: true, status: true } },
      },
    });
  }

  async getAddressById(addressId: string, userId: string) {
    return prisma.address.findFirst({
      where: { id: addressId, userId },
    });
  }

  async getNextOrderCode(): Promise<string> {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `ORD-${y}${m}${d}-`;

    const lastOrder = await prisma.order.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.code.slice(-4), 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }
}
