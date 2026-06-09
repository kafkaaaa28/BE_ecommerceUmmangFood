import { AppError } from '../../error/AppError.js';
import { ensureProductExists } from '../product.access.js';
import type { ProductRepository } from '../product/product.repository.js';
import type { CartResponse } from '../product.types.js';
import type { CartRepository } from './cart.repository.js';

export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async addToCart(userId: string, productId: string, variantId: string, quantity: number): Promise<CartResponse> {
    this.ensureProductId(productId);
    await ensureProductExists(productId, this.productRepository);
    return this.cartRepository.addToCart(userId, productId, variantId, quantity);
  }

  async updateCartItemQuantity(userId: string, productId: string, variantId: string, quantity: number) {
    this.ensureProductId(productId);
    await ensureProductExists(productId, this.productRepository);
    return this.cartRepository.updateCartItemQuantity(userId, productId, variantId, quantity);
  }

  async deleteFromCart(userId: string, productId: string, variantId: string): Promise<void> {
    this.ensureProductId(productId);
    await ensureProductExists(productId, this.productRepository);
    await this.cartRepository.deleteFromCart(userId, productId, variantId);
  }

  async getCart(userId: string): Promise<CartResponse> {
    const res = await this.cartRepository.getCart(userId);
    return res;
  }

  private ensureProductId(productId: string) {
    if (!productId) {
      throw new AppError('PRODUCT_ID_REQUIRED', 400, 'product tidak ditemukan');
    }
  }
}
