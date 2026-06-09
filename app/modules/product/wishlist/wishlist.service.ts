import { AppError } from '../../error/AppError.js';
import type { WishlistRepository } from './wishlist.repository.js';

export class WishListService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}
  addToWishlist(userId: string, productId: string) {
    if (!productId) {
      throw new AppError('PRODUCT_ID_REQUIRED', 400, 'product tidak ditemukan');
    }
    return this.wishlistRepository.addToWishlist(userId, productId);
  }
  deleteFromWishlist(userId: string, productId: string) {
    if (!productId) {
      throw new AppError('PRODUCT_ID_REQUIRED', 400, 'product tidak ditemukan');
    }
    return this.wishlistRepository.deleteFromWishlist(userId, productId);
  }
  getWishlist(userId: string) {
    return this.wishlistRepository.getWishlist(userId);
  }
}
