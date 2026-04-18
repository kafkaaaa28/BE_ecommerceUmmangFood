// import { BinderbytesRepository } from '../logistik/binderbytes.repository.js';
// import { getRajaOngkir, setRajaOngkir } from '../cache/RajaOngkirCache.js';
// import { AppError } from '../error/AppError.js';

// export interface ShippingCostResult {
//   courier: string;
//   courierCode?: string;
//   service: string;
//   serviceCode?: string;
//   cost: number;
//   etd: string;
//   description?: string;
// }

// export class ShippingCostService {
//   private bbRepo = new BinderbytesRepository();

//   /**
//    * Get shipping cost dari Binderbytes
//    *
//    * Using Binderbytes exclusively karena:
//    * - RajaOngkir tier starter (100 req/day) sudah deprecated
//    * - Binderbytes memiliki quota 50,000 req/day (jauh cukup)
//    * - Single API lebih simple dan maintainable
//    *
//    * @param originId Destination ID dari Binderbytes (wilayah ID)
//    * @param destinationId Destination ID dari Binderbytes (wilayah ID)
//    * @param weight Berat dalam gram
//    * @param courier Kode kurir (jne, pos, tiki, exactly, grab, dll)
//    */
//   async getShippingCost(originId: number, destinationId: number, weight: number, courier: string): Promise<ShippingCostResult[]> {
//     const cacheKey = `${originId}-${destinationId}-${weight}-${courier}`;

//     // Check cache first
//     try {
//       const cached = await getRajaOngkir(cacheKey, 'destination');
//       if (cached) {
//         return JSON.parse(cached);
//       }
//     } catch (err) {
//       // Silently ignore cache errors
//     }

//     try {
//       console.log(`🚚 Fetching shipping cost dari Binderbytes (Origin: ${originId}, Destination: ${destinationId}, Weight: ${weight}g, Courier: ${courier})`);

//       const bbResult = await this.bbRepo.getCost(originId, destinationId, weight, courier);

//       let results: ShippingCostResult[] = [];

//       if (bbResult && Array.isArray(bbResult) && bbResult.length > 0) {
//         results = bbResult.map((item: any) => ({
//           courier: item.courier || courier.toUpperCase(),
//           courierCode: (item.courier || courier).toLowerCase(),
//           service: item.service || 'standard',
//           serviceCode: (item.service || 'standard').toLowerCase(),
//           cost: Number(item.cost) || 0,
//           etd: item.etd || 'unknown',
//           description: `${item.service || 'Standard'} via ${item.courier || courier.toUpperCase()}`,
//         }));

//         // Cache the result dengan TTL 1 hari (86400 detik)
//         try {
//           await setRajaOngkir(cacheKey, JSON.stringify(results), 'destination', 86400);
//         } catch (cacheErr) {
//           console.warn('⚠️  Could not cache shipping cost result');
//         }

//         console.log(`✅ Binderbytes returned ${results.length} shipping options`);
//         return results;
//       }

//       // Jika no results, throw error
//       throw new AppError('SHIPPING_COST_EMPTY', 404, `Layanan pengiriman untuk kurir ${courier} tidak tersedia untuk rute ini`);
//     } catch (error: any) {
//       console.error(`❌ Binderbytes shipping cost error:`, error);

//       if (error instanceof AppError) {
//         throw error;
//       }

//       throw new AppError('SHIPPING_COST_FAILED', 502, error?.message || 'Gagal mendapatkan tarif pengiriman');
//     }
//   }

//   /**
//    * Get provinces from database (more efficient than API calls)
//    */
//   async getProvinces() {
//     const cacheKey = 'all';

//     try {
//       const cached = await getRajaOngkir(cacheKey, 'province');
//       if (cached) {
//         return JSON.parse(cached);
//       }

//       const data = await this.bbRepo.getProvinces();

//       if (!data || data.length === 0) {
//         throw new AppError('PROVINCE_NOT_FOUND', 404, 'Provinsi tidak ditemukan');
//       }

//       await setRajaOngkir(cacheKey, JSON.stringify(data), 'province', 86400 * 7); // Cache for 7 days

//       return data;
//     } catch (error: any) {
//       const cached = await getRajaOngkir(cacheKey, 'province');

//       if (cached) {
//         return JSON.parse(cached);
//       }

//       throw new AppError('FAILED_GET_PROVINCES', 500, error?.message || 'Gagal mengambil data provinsi');
//     }
//   }

//   /**
//    * Get cities from database (more efficient than API calls)
//    */
//   async getCities(provinceId: number) {
//     try {
//       if (!provinceId) {
//         throw new AppError('INVALID_PROVINCE_ID', 400, 'Province ID wajib diisi');
//       }

//       const cached = await getRajaOngkir(provinceId.toString(), 'city');
//       if (cached) {
//         return JSON.parse(cached);
//       }

//       const data = await this.bbRepo.getCities(provinceId);

//       if (!data || data.length === 0) {
//         throw new AppError('CITY_NOT_FOUND', 404, 'Kota tidak ditemukan');
//       }

//       await setRajaOngkir(provinceId.toString(), JSON.stringify(data), 'city', 86400 * 7); // Cache for 7 days
//       return data;
//     } catch (error: any) {
//       throw new AppError('FAILED_GET_CITIES', 500, error?.message || 'Gagal mengambil data kota');
//     }
//   }

//   /**
//    * Validate destination from Binderbytes
//    * @deprecated Gunakan location service untuk search kota, jangan via API
//    */
//   async validateDestination(search: string) {
//     try {
//       if (!search) {
//         throw new AppError('DESTINATION_KEYWORD_REQUIRED', 400, 'Kata kunci destinasi wajib diisi');
//       }

//       // First try cache
//       const cached = await getRajaOngkir(search, 'destination');
//       if (cached) {
//         return JSON.parse(cached);
//       }

//       // Get from Binderbytes API
//       const provinces = await this.bbRepo.getProvinces();
//       const results = [];

//       // Search in all provinces and cities
//       for (const province of provinces) {
//         const cities = await this.bbRepo.getCities(Number(province.id));
//         const matching = cities.filter((city: any) => city.name.toLowerCase().includes(search.toLowerCase()) || city.id.toString().includes(search));

//         if (matching.length > 0) {
//           results.push(
//             ...matching.map((city: any) => ({
//               province: province.name,
//               city: city.name,
//               binderbytesId: city.id,
//             })),
//           );
//         }
//       }

//       if (!results.length) return null;

//       const destination = results[0];

//       // Cache destination
//       await setRajaOngkir(search, JSON.stringify(destination), 'destination', 86400 * 7);

//       return destination;
//     } catch (error: any) {
//       throw new AppError('FAILED_GET_DESTINATIONS', 500, error?.message || 'Gagal mengambil data destinasi');
//     }
//   }
// }
