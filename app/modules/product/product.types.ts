export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type MediaType = 'IMAGE' | 'VIDEO';

export type StockMovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RESERVE' | 'RELEASE' | 'DEDUCT';

export type ProductCategoryInput = {
  name: string;
  slug: string;
};

export type ProductCategoryUpdateInput = Partial<ProductCategoryInput>;

export type ProductCategoryResponse = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductInput = {
  name: string;
  slug: string;
  description?: string | null;
  status?: ProductStatus;
  categoryId?: string | null;
};

export type ProductUpdateInput = Partial<ProductInput>;

export type ProductMediaInput = {
  variantId?: string | null;
  type?: MediaType;
  url: string;
  alt?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type ProductMediaUploadInput = {
  variantId?: string | null;
  alt?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type ProductMediaUpdateInput = Partial<ProductMediaInput>;

export type ProductMediaResponse = {
  id: string;
  productId: string;
  variantId: string | null;
  type: MediaType;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
};

export type ProductResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  categoryId: string | null;
  category: ProductCategoryResponse | null;
  productMedias: ProductMediaResponse[];
  variants?: ProductVariantResponse[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariantInput = {
  sku: string;
  variantName: string;
  price: number | string;
  weightGram?: number | null;
  isActive?: boolean;
  imageUrl?: string | null;
  onHand?: number;
  reserved?: number;
  reorderLevel?: number;
};

export type ProductVariantUpdateInput = Partial<Omit<ProductVariantInput, 'onHand' | 'reserved'>> & {
  reorderLevel?: number;
};
export type InventoryUpdateInput = {
  reorderLevel?: number;
};

export type InventoryResponse = {
  id: string;
  variantId: string;
  onHand: number;
  reserved: number;
  reorderLevel: number;
  updatedAt: Date;
};

export type ProductVariantResponse = {
  id: string;
  productId: string;
  sku: string;
  variantName: string;
  price: unknown;
  weightGram: number | null;
  isActive: boolean;
  imageUrl: string | null;
  productMedias: ProductMediaResponse[];
  inventory: InventoryResponse | null;
};

export type StockMovementInput = {
  inventoryId: string;
  type: StockMovementType;
  qty: number;
  note?: string | null;
  refType?: string | null;
  refId?: string | null;
};

export type StockMovementUpdateInput = Partial<Omit<StockMovementInput, 'inventoryId'>> & {
  inventoryId?: never;
};

export type StockMovementResponse = {
  id: string;
  inventoryId: string;
  type: StockMovementType;
  qty: number;
  note: string | null;
  refType: string | null;
  refId: string | null;
  actorId: string | null;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
};
export type ProductListQuery = {
  categoryId?: string;
  status?: ProductStatus;
};

export type StockMovementListQuery = {
  inventoryId?: string;
  type?: StockMovementType;
};

export type InventoryDelta = {
  onHand: number;
  reserved: number;
};

export type CartItemInput = {
  quantity?: number;
};

export type CartItemUpdateInput = {
  quantity: number;
};

export type CartItemProductResponse = {
  id: string;
  slug: string;
  name: string;
  productMedias: {
    id: string;
    url: string;
  };
};

export type CartItemVariantResponse = {
  id: string;
  sku: string | null;
  variantName: string | null;
  price: unknown;
  imageUrl: string | null;
  inventory: {
    onHand: number;
    reserved: number;
  } | null;
};

export type CartItemResponse = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: CartItemProductResponse;
  variant: CartItemVariantResponse;
};

export type CartResponse = {
  id: string | null;
  userId: string;
  totalItems: number;
  totalQuantity: number;
  items: CartItemResponse[];
};
