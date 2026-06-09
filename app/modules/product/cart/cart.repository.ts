import { prisma } from '../../../config/prisma.js';
import { AppError } from '../../error/AppError.js';
import type { CartResponse } from '../product.types.js';
import type { Prisma } from '../../../../generated/prisma/client.js';

const cartSelect = {
  id: true,
  userId: true,
  updatedAt: true,

  items: {
    select: {
      id: true,

      productId: true,
      variantId: true,

      quantity: true,

      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          productMedias: {
            where: {
              isPrimary: true,
            },
            take: 1,
            orderBy: {
              sortOrder: 'asc',
            },
            select: {
              id: true,
              url: true,
            },
          },
        },
      },

      variant: {
        select: {
          id: true,
          sku: true,
          variantName: true,
          price: true,
          imageUrl: true,

          inventory: {
            select: {
              onHand: true,
              reserved: true,
            },
          },
        },
      },
    },

    orderBy: {
      id: 'desc',
    },
  },
} satisfies Prisma.CartSelect;

type CartPayload = Prisma.CartGetPayload<{
  select: typeof cartSelect;
}>;

export class CartRepository {
  async addToCart(userId: string, productId: string, variantId: string, quantity: number): Promise<CartResponse> {
    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
        select: { id: true },
      });

      const variant = await tx.productVariant.findFirst({
        where: {
          id: variantId,
          productId,
          isActive: true,
        },
        select: {
          id: true,
          inventory: {
            select: {
              onHand: true,
              reserved: true,
            },
          },
        },
      });

      if (!variant) {
        throw new Error('Varian produk tidak ditemukan');
      }

      const availableStock = Math.max((variant.inventory?.onHand ?? 0) - (variant.inventory?.reserved ?? 0), 0);

      if (quantity <= 0) {
        throw new Error('Quantity harus lebih dari 0');
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          variantId,
        },
        select: {
          id: true,
          quantity: true,
        },
      });

      const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

      if (nextQuantity > availableStock) {
        throw new Error('Stok tidak mencukupi');
      }

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: nextQuantity,
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            variantId,
            quantity,
          },
        });
      }

      const result = await tx.cart.findUnique({
        where: { userId },
        select: cartSelect,
      });

      return this.toCartResponse(result, userId);
    });
  }
  async updateCartItemQuantity(userId: string, productId: string, variantId: string, quantity: number): Promise<CartResponse> {
    return prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!cart) {
        throw new AppError('CART_NOT_FOUND', 404, 'Keranjang tidak ditemukan');
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          variantId,
        },
        select: {
          id: true,
        },
      });

      if (!existingItem) {
        throw new AppError('CART_ITEM_NOT_FOUND', 404, 'Item keranjang tidak ditemukan');
      }

      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity },
      });

      const result = await tx.cart.findUnique({
        where: { userId },
        select: cartSelect,
      });

      return this.toCartResponse(result, userId);
    });
  }

  async deleteFromCart(userId: string, productId: string, variantId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!cart) {
        throw new AppError('CART_NOT_FOUND', 404, 'Keranjang tidak ditemukan');
      }

      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
          variantId,
        },
        select: {
          id: true,
        },
      });

      if (!existingItem) {
        throw new AppError('CART_ITEM_NOT_FOUND', 404, 'Item keranjang tidak ditemukan');
      }

      await tx.cartItem.delete({
        where: { id: existingItem.id },
      });
    });
  }

  async getCart(userId: string): Promise<CartResponse> {
    const result = await prisma.cart.findUnique({
      where: { userId },
      select: cartSelect,
    });

    return this.toCartResponse(result, userId);
  }

  private toCartResponse(cart: CartPayload | null, userId: string): CartResponse {
    if (!cart) {
      return {
        id: null,
        userId,
        totalItems: 0,
        totalQuantity: 0,
        items: [],
      };
    }

    const items = cart.items.map((item) => {
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,

        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          productMedias: {
            id: item.product.productMedias[0]?.id ?? '',
            url: item.product.productMedias[0]?.url ?? '',
          },
        },

        variant: {
          id: item.variant.id,
          sku: item.variant.sku,
          variantName: item.variant.variantName,
          price: item.variant.price,
          imageUrl: item.variant.imageUrl ?? null,
          inventory: item.variant.inventory,
        },
      };
    });

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      totalItems: items.length,
      totalQuantity,
      items,
    };
  }
}
