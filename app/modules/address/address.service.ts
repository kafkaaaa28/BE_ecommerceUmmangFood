import { AppError } from '../error/AppError.js';
import { AddressRepository } from './address.repository.js';
import { getAddressCache, setAddressCache } from '../cache/addressCache.js';
import { UserRepository } from '../user/user.repository.js';
import type { CreateAddressInput, UpdateAddressInput, ResponseAddressByUserId } from './address.types.js';
import type { CreateAddressSellerInput } from './address.schema.js';
export class AddressService {
  constructor(private readonly addressRepo: AddressRepository) {}

  userRepo = new UserRepository();
  async searchSubdistricts(keyword: string, limit = 20) {
    if (!keyword || keyword.trim().length < 3) {
      throw new AppError('INVALID_SEARCH_KEYWORD', 400, 'Minimal 3 karakter');
    }
    const normalized = keyword.trim().toLowerCase();
    const cacheKey = `${normalized}:${limit}`;
    try {
      const cachedResults = await getAddressCache(cacheKey, 'searchSubdistricts');
      if (cachedResults) {
        return JSON.parse(cachedResults);
      }

      const results = await this.addressRepo.searchSubdistricts(keyword, limit);

      if (results.length === 0) {
        await setAddressCache(cacheKey, JSON.stringify([]), 'searchSubdistricts', 30);
        return [];
      }

      const mapped = results.map((subdistrict) => ({
        id: subdistrict.id_kelurahan,
        name: subdistrict.name,
        districtId: subdistrict.district?.id_kecamatan ?? null,
        district: subdistrict.district?.name ?? null,
        cityId: subdistrict.district?.city?.id_kabupaten ?? null,
        city: subdistrict.district.city?.name ?? null,
        provinceId: subdistrict.district?.city?.province?.id_provinsi ?? null,
        provinsi: subdistrict.district.city.province?.name ?? null,
      }));

      await setAddressCache(cacheKey, JSON.stringify(mapped), 'searchSubdistricts');

      return mapped;
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      throw new AppError('SEARCH_SUBDISTRICTS_FAILED', 500, 'Gagal mencari kelurahan');
    }
  }
  async createAddress(authUserId: string, input: CreateAddressInput) {
    const user = await this.userRepo.findById(authUserId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    }
    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    }

    const countAddress = await this.addressRepo.findCountAddressByUserId(authUserId);
    if (countAddress >= 5) {
      throw new AppError('ADDRESS_LIMIT_REACHED', 400, 'Batas maksimal alamat yang dapat dibuat adalah 5');
    }

    return await this.addressRepo.CreateAddressUser({
      user: {
        userId: authUserId,
      },
      input: {
        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        jalan: input.jalan,
        detail: input.detail ?? null,
        provinsi: input.provinsi,
        kota: input.kota,
        kecamatan: input.kecamatan,
        kelurahan: input.kelurahan,
        kodePos: input.kodePos ?? null,
        provinceId: input.provinceId ?? null,
        districtId: input.districtId ?? null,
        subdistrictId: input.subdistrictId ?? null,
        cityId: input.cityId ?? null,
      },
    });
  }
  async getAddressByUserId(userId: string): Promise<ResponseAddressByUserId[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    }
    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    }
    return await this.addressRepo.getAddressByid(userId);
  }
  async updateAddress(addressId: string, userId: string, input: UpdateAddressInput) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    }
    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    }

    if (!Object.keys(input).length) {
      throw new AppError('EMPTY_UPDATE', 400, 'Minimal harus ada satu field yang diupdate');
    }

    try {
      const result = await this.addressRepo.updateAddress(addressId, userId, input);
      return result;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('ADDRESS_NOT_FOUND', 404, 'Alamat tidak ditemukan atau Anda tidak memiliki akses');
      }
      throw new AppError('UPDATE_ADDRESS_FAILED', 500, 'Gagal mengupdate alamat');
    }
  }
  async deleteAddress(addressId: string, userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'User tidak ditemukan');
    }
    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'Akun tidak tersedia');
    }

    try {
      await this.addressRepo.deleteAddress(addressId, userId);
      return { success: true, message: 'Alamat berhasil dihapus' };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('ADDRESS_NOT_FOUND', 404, 'Alamat tidak ditemukan atau Anda tidak memiliki akses');
      }
      throw new AppError('DELETE_ADDRESS_FAILED', 500, 'Gagal menghapus alamat');
    }
  }
  async createAddressSeller(input: CreateAddressSellerInput, role: string) {
    if (role !== 'SELLER') {
      throw new AppError('FORBIDDEN', 403, 'Hanya penjual yang dapat membuat alamat toko');
    }
    return await this.addressRepo.createAddressSeller(input);
  }
  async getAddressSeller() {
    return await this.addressRepo.getAddressSeller();
  }
}
