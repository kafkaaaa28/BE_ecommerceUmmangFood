import sharp from 'sharp';
import crypto from 'crypto';
import type { AuthService } from '../../auth/auth.services.js';
import type { UserRepository } from '../../user/user.repository.js';
import { AppError } from '../../error/AppError.js';
import { classifyImageBuffer, isSafeImage } from '../../image/image.services.js';
import { destroyCloudinaryAssetByUrl, uploadBufferToCloudinary } from '../../../utils/upload-to-cloudinary.js';
import type { ProductMediaInput, ProductMediaResponse, ProductMediaUpdateInput, ProductMediaUploadInput } from '../product.types.js';
import { ensureProductExists, ensureProductMediaExists, ensureSeller, ensureVariantBelongsToProduct } from '../product.access.js';
import type { ProductRepository } from '../product/product.repository.js';
import type { VariantRepository } from '../variant/variant.repository.js';
import type { ProductMediaRepository } from './product-media.repository.js';

export class ProductMediaService {
  constructor(
    private readonly productMediaRepo: ProductMediaRepository,
    private readonly productRepo: ProductRepository,
    private readonly variantRepo: VariantRepository,
    private readonly authService: AuthService,
    private readonly userRepo: UserRepository,
  ) {}

  async createProductMedia(userId: string, productId: string, input: ProductMediaInput): Promise<ProductMediaResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureProductExists(productId, this.productRepo);
    await ensureVariantBelongsToProduct(productId, input.variantId, this.variantRepo);
    return this.productMediaRepo.createProductMedia(productId, input);
  }

  async listProductMediaByProductId(userId: string, productId: string): Promise<ProductMediaResponse[]> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureProductExists(productId, this.productRepo);
    return this.productMediaRepo.listProductMediaByProductId(productId);
  }

  async getProductMediaById(userId: string, mediaId: string): Promise<ProductMediaResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    return ensureProductMediaExists(mediaId, this.productMediaRepo);
  }

  async updateProductMedia(userId: string, mediaId: string, input: ProductMediaUpdateInput): Promise<ProductMediaResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    const media = await ensureProductMediaExists(mediaId, this.productMediaRepo);
    await ensureVariantBelongsToProduct(media.productId, input.variantId, this.variantRepo);

    return this.productMediaRepo.updateProductMedia(mediaId, input);
  }

  async deleteProductMedia(userId: string, mediaId: string): Promise<ProductMediaResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    const media = await ensureProductMediaExists(mediaId, this.productMediaRepo);
    const deletedMedia = await this.productMediaRepo.deleteProductMedia(mediaId);

    if (media.type === 'IMAGE') {
      await destroyCloudinaryAssetByUrl(media.url, 'image').catch(() => null);
    }

    if (media.type === 'VIDEO') {
      await destroyCloudinaryAssetByUrl(media.url, 'video').catch(() => null);
    }

    return deletedMedia;
  }

  async uploadProductMedia(userId: string, productId: string, input: ProductMediaUploadInput, file?: Express.Multer.File): Promise<ProductMediaResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureProductExists(productId, this.productRepo);
    await ensureVariantBelongsToProduct(productId, input.variantId, this.variantRepo);

    if (!file) {
      throw new AppError('FILE_REQUIRED', 400, 'Media produk wajib diupload pada field `file` dalam format JPG, PNG, atau WEBP dengan ukuran maksimal 5 MB', {
        field: 'file',
        allowedFormats: 'JPG, PNG, atau WEBP',
        maxFileSizeMB: 5,
      });
    }

    const processedBuffer = await sharp(file.buffer).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();

    const predictions = await classifyImageBuffer(processedBuffer);
    if (!isSafeImage(predictions)) {
      throw new AppError('INAPPROPRIATE_IMAGE', 422, 'Media produk terdeteksi mengandung konten yang tidak diizinkan');
    }

    const uploaded = await uploadBufferToCloudinary(processedBuffer, crypto.randomUUID(), {
      folder: `product-media/${productId}`,
      overwrite: false,
      resourceType: 'image',
    });

    return this.productMediaRepo.createProductMedia(productId, {
      variantId: input.variantId,
      type: 'IMAGE',
      url: uploaded.secure_url,
      alt: input.alt,
      sortOrder: input.sortOrder,
      isPrimary: input.isPrimary,
    });
  }
}
