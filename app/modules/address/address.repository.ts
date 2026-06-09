import { prisma } from '../../config/prisma.js';
import { toBinderbyteDistrictId } from './address.helper.js';
import type { CreateAddressSellerInput } from './address.schema.js';
import { type CreateAddressInput, type UpdateAddressInput, type ResponseAddressByUserId } from './address.types.js';
export class AddressRepository {
  async searchSubdistricts(keyword: string, limit = 20) {
    const normalizedKeyword = keyword.trim().normalize('NFKC').toLowerCase();

    return await prisma.subdistrict.findMany({
      where: {
        OR: [
          { name: { startsWith: normalizedKeyword } },
          {
            district: {
              name: { startsWith: normalizedKeyword },
            },
          },
        ],
      },
      select: {
        id_kelurahan: true,
        name: true,
        district: {
          select: {
            id_kecamatan: true,
            name: true,
            city: {
              select: {
                id_kabupaten: true,
                name: true,
                province: {
                  select: {
                    id_provinsi: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      take: limit,
      orderBy: [{ name: 'asc' }],
    });
  }
  async CreateAddressUser({ input, user }: { input: CreateAddressInput; user: { userId: string } }) {
    const binderbyteDistrictId = toBinderbyteDistrictId(input.districtId);
    return prisma.address.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.userId,

        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        jalan: input.jalan,
        detail: input.detail ?? null,

        provinceId: input.provinceId,
        cityId: input.cityId ?? null,
        subdistrictId: input.subdistrictId ?? null,
        districtId: input.districtId ?? null,

        provinsi: input.provinsi,
        kota: input.kota,
        kecamatan: input.kecamatan,
        kelurahan: input.kelurahan,

        kodePos: input.kodePos,
        origin: binderbyteDistrictId,
        originLabel: input.kecamatan && input.kota ? `${input.kecamatan}, ${input.kota}` : null,
      },
    });
  }
  async findCountAddressByUserId(userId: string) {
    return prisma.address.count({
      where: { userId },
    });
  }
  async getAddressByid(userId: string): Promise<ResponseAddressByUserId[]> {
    return prisma.address.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        label: true,
        recipientName: true,
        phone: true,
        jalan: true,
        detail: true,
        provinsi: true,
        kota: true,
        kecamatan: true,
        kelurahan: true,
        kodePos: true,
        origin: true,
      },
    });
  }
  async updateAddress(addressId: string, userId: string, input: UpdateAddressInput) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId },
      select: { label: true },
    });

    if (!existing) {
      throw Object.assign(new Error('Not found'), { code: 'P2025' });
    }

    const nextLabel = input.label ?? existing.label;
    const nextDistrictId = input.districtId;

    return prisma.address.update({
      where: { id: addressId, userId },
      data: {
        ...(input.label !== undefined && { label: input.label }),
        ...(input.recipientName !== undefined && { recipientName: input.recipientName }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.jalan !== undefined && { jalan: input.jalan }),
        ...(input.detail !== undefined && { detail: input.detail }),
        ...(input.provinsi !== undefined && { provinsi: input.provinsi }),
        ...(input.kota !== undefined && { kota: input.kota }),
        ...(input.kecamatan !== undefined && { kecamatan: input.kecamatan }),
        ...(input.kelurahan !== undefined && { kelurahan: input.kelurahan }),
        ...(input.kodePos !== undefined && { kodePos: input.kodePos }),
        ...(input.districtId !== undefined && { districtId: input.districtId }),
        ...(input.subdistrictId !== undefined && { subdistrictId: input.subdistrictId }),
        ...(input.provinceId !== undefined && { provinceId: input.provinceId }),
        ...(input.cityId !== undefined && { cityId: input.cityId }),
        ...(nextDistrictId !== undefined && {
          origin: nextDistrictId,
          originLabel: nextDistrictId ? `${nextLabel} - ${nextDistrictId}` : null,
        }),
      },
    });
  }

  async deleteAddress(addressId: string, userId: string) {
    return prisma.address.delete({
      where: {
        id: addressId,
        userId: userId,
      },
    });
  }
  async createAddressSeller(input: CreateAddressSellerInput) {
    const binderbyteDistrictId = toBinderbyteDistrictId(input.districtId);

    return prisma.storeSetting.create({
      data: {
        originId: binderbyteDistrictId ?? input.districtId,
        originLabel: `${input.label} - ${binderbyteDistrictId}`,
        storeName: input.storeName ?? null,
      },
    });
  }
  async getAddressSeller() {
    return prisma.storeSetting.findMany({
      where: {
        id: 'store_setting',
      },
      select: {
        id: true,
        originId: true,
        originLabel: true,
        storeName: true,
      },
    });
  }
}
