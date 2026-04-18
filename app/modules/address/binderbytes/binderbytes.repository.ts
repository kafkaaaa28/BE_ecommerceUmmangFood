import axios, { AxiosError, type AxiosInstance } from 'axios';
import { AppError } from '../../error/AppError.js';
import type { BinderbytesProvince, BinderbytesCity, BinderbytesDistrict, BinderbytesSubdistrict } from './binderbytes.types.js';

const getBinderbytesConfig = () => {
  const apiKey = process.env.BINDERBYTES_API_KEY;

  if (!apiKey) {
    throw new AppError('BINDERBYTES_CONFIG_INVALID', 500, 'Konfigurasi Binderbytes belum lengkap');
  }

  return {
    BINDERBYTES_BASE_URL: 'https://api.binderbyte.com',
    BINDERBYTES_API_KEY: apiKey,
  };
};

export class BinderbytesRepository {
  private readonly http: AxiosInstance;

  constructor() {
    const config = getBinderbytesConfig();

    this.http = axios.create({
      baseURL: config.BINDERBYTES_BASE_URL,
    });
  }

  async getProvinces(): Promise<BinderbytesProvince[]> {
    try {
      const response = await this.http.get('/wilayah/provinsi', {
        params: {
          api_key: getBinderbytesConfig().BINDERBYTES_API_KEY,
        },
      });
      return response.data?.value ?? [];
    } catch (error) {
      this.handleRequestError(error);
    }
  }

  async getCities(id_provinsi: string): Promise<BinderbytesCity[]> {
    try {
      const response = await this.http.get(`/wilayah/kabupaten?id_provinsi=${id_provinsi}`, {
        params: {
          api_key: getBinderbytesConfig().BINDERBYTES_API_KEY,
        },
      });
      return response.data?.value ?? [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Cities not found for province ID ${id_provinsi}, skipping.`);
        return []; // safe fallback
      }
      this.handleRequestError(error); // untuk error lain tetap throw
    }
  }

  async getDistricts(id_kabupaten: string): Promise<BinderbytesDistrict[]> {
    try {
      const response = await this.http.get(`/wilayah/kecamatan?id_kabupaten=${id_kabupaten}`, {
        params: { api_key: getBinderbytesConfig().BINDERBYTES_API_KEY },
      });
      return response.data?.value ?? [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Districts not found for city ID ${id_kabupaten}, skipping.`);
        return []; // safe fallback
      }
      this.handleRequestError(error); // untuk error lain tetap throw
    }
  }

  async getSubdistricts(id_kecamatan: string): Promise<BinderbytesSubdistrict[]> {
    try {
      const response = await this.http.get(`/wilayah/kelurahan?id_kecamatan=${id_kecamatan}`, {
        params: {
          api_key: getBinderbytesConfig().BINDERBYTES_API_KEY,
        },
      });
      return response.data?.value ?? [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Subdistricts not found for district ID ${id_kecamatan}, skipping.`);
        return []; // safe fallback
      }
      this.handleRequestError(error); // untuk error lain tetap throw
    }
  }

  async getProvinceById(provinceId: string): Promise<BinderbytesProvince | null> {
    const provinces = await this.getProvinces();
    return provinces.find((item) => Number(item.id) === Number(provinceId)) ?? null;
  }

  async getCityById(id_provinsi: string, id_kabupaten: string): Promise<BinderbytesCity | null> {
    const cities = await this.getCities(id_provinsi);
    return cities.find((item) => Number(item.id) === Number(id_kabupaten)) ?? null;
  }

  /**
   * Get shipping cost dari Binderbytes
   * @param originCity ID kota asal (Binderbytes ID)
   * @param destinationCity ID kota tujuan (Binderbytes ID)
   * @param weight Berat dalam gram
   * @param courier Kode kurir (jne, pos, tiki, exactly, grab, dll)
   */
  async getCost(originCity: string, destinationCity: string, weight: string, courier: string): Promise<any[]> {
    if (!courier || courier.trim().length === 0) {
      throw new AppError('COURIER_INVALID', 400, 'Kode kurir tidak valid');
    }

    try {
      const response = await this.http.get('/biaya-kirim', {
        params: {
          api_key: getBinderbytesConfig().BINDERBYTES_API_KEY,
          kota_asal: originCity,
          kota_tujuan: destinationCity,
          berat: weight,
          kurir: courier.toLowerCase(),
        },
      });

      // Transform Binderbytes response to standard format
      const data = response.data?.value ?? [];

      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          courier: item.kurir || item.courier,
          service: item.layanan || item.service,
          cost: item.harga || item.cost,
          etd: item.waktu_kirim || item.etd,
        }));
      }

      return [];
    } catch (error) {
      this.handleRequestError(error);
    }
  }

  private handleRequestError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof AxiosError) {
      throw new AppError('BINDERBYTES_REQUEST_FAILED', 502, 'Gagal mengambil data Binderbytes', {
        upstreamMessage: error.message,
        upstreamStatus: error.response?.status,
      });
    }

    throw new AppError('BINDERBYTES_REQUEST_FAILED', 502, 'Gagal mengambil data Binderbytes');
  }
}
