import { prisma } from '../../../config/prisma.js';

export class WishlistRepository {
  addToWishlist(userId: string, productId: string) {
    return prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {},
    });
  }
  deleteFromWishlist(userId: string, productId: string) {
    return prisma.wishlist.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }
  getWishlist(userId: string) {
    return prisma.wishlist.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        createdAt: true,

        product: {
          select: {
            id: true,
            slug: true,
            name: true,

            productMedias: {
              take: 1,
              orderBy: {
                sortOrder: 'asc',
              },
              select: {
                id: true,
                url: true,
                alt: true,
                isPrimary: true,
              },
            },

            variants: {
              select: {
                id: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }
}
