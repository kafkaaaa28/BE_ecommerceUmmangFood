import axios, { AxiosError, type AxiosInstance } from 'axios';
import FormData from 'form-data';

import { getBinderbytesConfig } from '../../utils/api.js';
import { AppError } from '../error/AppError.js';
import { getShippingCache, setShippingCache } from '../cache/shiippingCache.js';

type ShippingCostItem = {
  courierCode: string;
  courierName: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
};

type GetShippingCostParams = {
  origin: string;
  destination: string;
  weight: string;
  courier: string;
};

type BinderbyteCostItem = {
  code?: string;
  name?: string;
  service?: string;
  type?: string;
  price?: string | number;
  estimated?: string;
};

type BinderbyteResult = {
  code?: string;
  name?: string;
  costs?: BinderbyteCostItem[];
};

type BinderbyteCostResponse = {
  code?: string;
  message?: string;
  data?: {
    weight?: string;
    results?: BinderbyteResult[];
  };
};

export class ShippingService {
  private readonly http: AxiosInstance;

  constructor() {
    const config = getBinderbytesConfig();

    this.http = axios.create({
      baseURL: config.BINDERBYTES_BASE_URL,
      timeout: 15_000,
    });
  }

  async getShippingCost({ origin, destination, weight, courier }: GetShippingCostParams): Promise<ShippingCostItem[]> {
    if (!origin?.trim()) {
      throw new AppError('ORIGIN_REQUIRED', 400, 'Origin wajib diisi');
    }

    if (!destination?.trim()) {
      throw new AppError('DESTINATION_REQUIRED', 400, 'Destination wajib diisi');
    }

    if (!Number.isFinite(Number(weight)) || Number(weight) <= 0) {
      throw new AppError('WEIGHT_INVALID', 400, 'Berat tidak valid');
    }

    if (!courier?.trim()) {
      throw new AppError('COURIER_REQUIRED', 400, 'Kurir wajib diisi');
    }

    try {
      const config = getBinderbytesConfig();
      const normalizedOrigin = origin.trim();
      const normalizedDestination = destination.trim();
      const normalizedWeight = String(Number(weight));
      const normalizedCourier = courier.trim().toLowerCase();

      const cacheKey = `${normalizedOrigin}:${normalizedDestination}:${normalizedWeight}:${normalizedCourier}`;
      const formData = new FormData();
      formData.append('origin', normalizedOrigin);
      formData.append('destination', normalizedDestination);
      formData.append('weight', normalizedWeight);
      formData.append('courier', normalizedCourier);
      formData.append('api_key', config.BINDERBYTES_API_KEY);

      const cached = await getShippingCache(cacheKey, 'shippingCost');
      if (cached) {
        return JSON.parse(cached) as ShippingCostItem[];
      }

      const response = await this.http.post<BinderbyteCostResponse>('/v1/cost', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      const data = response.data;

      if (data?.code !== '200') {
        throw new AppError('BINDERBYTE_FAILED', 400, data?.message || 'Binderbyte gagal menghitung ongkir');
      }

      const results = data.data?.results ?? [];

      const shippingCosts = results.flatMap((result) =>
        (result.costs ?? []).map((item) => ({
          courierCode: String(result.code ?? item.code ?? ''),
          courierName: String(result.name ?? item.name ?? ''),
          service: String(item.service ?? ''),
          description: String(item.type ?? ''),
          cost: Number(item.price ?? 0),
          etd: String(item.estimated ?? ''),
        })),
      );
      await setShippingCache(cacheKey, JSON.stringify(shippingCosts), 'shippingCost', 60 * 60);
      return shippingCosts;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof AxiosError) {
        throw new AppError('BINDERBYTE_REQUEST_FAILED', error.response?.status ?? 502, error.response?.data?.message || 'Gagal menghubungi Binderbyte', {
          originalError: error.message,
        });
      }

      throw new AppError('GET_SHIPPING_COST_FAILED', 500, 'Gagal mendapatkan ongkos kirim', {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
