import { AppError } from '../../error/AppError.js';
import { getProductCache, setProductCache } from '../../cache/productCache.js';
import type { ProductRepository } from '../product/product.repository.js';

export class CatalogService {
  constructor(private readonly productRepo: ProductRepository) {}

  async searchCatalog(keyword: string, limit = 20) {
    if (!keyword || keyword.trim().length < 3) {
      throw new AppError('INVALID_SEARCH_KEYWORD', 400, 'Minimal 3 karakter');
    }

    const normalized = keyword.trim().toLowerCase();
    const cacheKey = `${normalized}:${limit}`;

    try {
      const cachedResults = await getProductCache(cacheKey, 'searchProducts');
      if (cachedResults) {
        return JSON.parse(cachedResults);
      }

      const result = await this.productRepo.searchCatalog(keyword, limit);

      if (result.products.length === 0 && result.categories.length === 0) {
        await setProductCache(cacheKey, JSON.stringify({ products: [], categories: [] }), 'searchProducts', 30);
        return { products: [], categories: [] };
      }

      await setProductCache(cacheKey, JSON.stringify(result), 'searchProducts');
      return result;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      console.error('SEARCH_CATALOG_ERROR', { error });
      throw new AppError('SEARCH_PRODUCTS_FAILED', 500, 'Gagal mencari produk');
    }
  }
}
