import { OrderStatus } from '../../../generated/prisma/client.js';

export type CreateOrderInput = {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
  addressId: string;
  courierCode: string;
  serviceCode: string;
  serviceName: string;
  shippingFee: number;
  shippingEtd: string;
  notes?: string;
};

export type OrderResponse = {
  id: string;
  code: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  expiresAt: Date | null;
  createdAt: Date;
  items: Array<{
    id: string;
    variantId: string;
    variantName: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl: string | null;
  }>;
  payment: {
    snapToken: string | null;
    checkoutUrl: string | null;
  } | null;
};

export type OrderListItem = {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: Date;
  paidAt: Date | null;
};
