import { AppError } from '../../error/AppError.js';
import { LocationRepository } from '../../address/location/location.repository.js';

export class LocationService {
  private locationRepo: LocationRepository;

  constructor() {
    this.locationRepo = new LocationRepository();
  }

  async getAllProvinces() {
    try {
      const provinces = await this.locationRepo.getAllProvinces();

      if (provinces.length === 0) {
        throw new AppError('PROVINCE_NOT_FOUND', 404, 'Provinsi tidak ditemukan');
      }

      return provinces.map((p) => ({
        id: p.id,
        name: p.name,
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('GET_PROVINCES_FAILED', 500, 'Gagal mengambil data provinsi');
    }
  }

  async getCitiesByProvince(id_provinsi: string) {
    try {
      const province = await this.locationRepo.getProvinceById(id_provinsi);

      if (!province) {
        throw new AppError('PROVINCE_NOT_FOUND', 404, 'Provinsi tidak ditemukan');
      }

      const cities = await this.locationRepo.getCitiesByProvince(id_provinsi);

      return cities.map((c) => ({
        id: c.id,
        id_kabupaten: c.id_kabupaten, // Binderbytes city ID
        id_provinsi: c.id_provinsi, // Binderbytes province ID
        name: c.name,
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('GET_CITIES_FAILED', 500, 'Gagal mengambil data kota');
    }
  }

  async getDistrictsByCity(id_kabupaten: string) {
    try {
      const city = await this.locationRepo.getCityByBinderbytesId(id_kabupaten);

      if (!city) {
        throw new AppError('CITY_NOT_FOUND', 404, 'Kota tidak ditemukan');
      }

      const districts = await this.locationRepo.getDistrictsByCity(id_kabupaten);

      return districts.map((d) => ({
        id: d.id,
        id_kabupaten: d.id_kabupaten,
        id_kecamatan: d.id_kecamatan,
        name: d.name,
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('GET_DISTRICTS_FAILED', 500, 'Gagal mengambil data kecamatan');
    }
  }

  async getSubdistrictsByDistrict(id_kecamatan: string) {
    try {
      const district = await this.locationRepo.getDistrictById(id_kecamatan);

      if (!district) {
        throw new AppError('DISTRICT_NOT_FOUND', 404, 'Kecamatan tidak ditemukan');
      }

      const subdistricts = await this.locationRepo.getSubdistrictsByDistrict(id_kecamatan);

      return subdistricts.map((s) => ({
        id: s.id,
        id_kelurahan: s.id_kelurahan,
        id_kecamatan: s.id_kecamatan,
        name: s.name,
      }));
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('GET_SUBDISTRICTS_FAILED', 500, 'Gagal mengambil data kelurahan');
    }
  }
}
