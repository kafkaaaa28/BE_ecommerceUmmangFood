import { prisma } from '../../../config/prisma.js';
import { Prisma } from '../../../../generated/prisma/client.js';
export class LocationRepository {
  async getProvinceById(id_provinsi: string) {
    return await prisma.province.findUnique({
      where: { id_provinsi },
    });
  }
  async getProvinceByBinderbytesId(id_provinsi: string) {
    return await prisma.province.findUnique({
      where: { id_provinsi },
    });
  }

  async getAllProvinces() {
    return await prisma.province.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createProvince(data: Prisma.ProvinceCreateInput) {
    return await prisma.province.create({ data });
  }

  async upsertProvince(where: Prisma.ProvinceWhereUniqueInput, create: Prisma.ProvinceCreateInput, update: Prisma.ProvinceUpdateInput) {
    return await prisma.province.upsert({
      where,
      create,
      update,
    });
  }

  // CITY OPERATIONS
  async getCityById(id: string) {
    return await prisma.city.findUnique({
      where: { id },
      include: { province: true },
    });
  }

  async getCityByBinderbytesId(id_kabupaten: string) {
    return await prisma.city.findFirst({
      where: { id_kabupaten },
      include: { province: true },
    });
  }

  async getCitiesByProvince(id_provinsi: string) {
    return await prisma.city.findMany({
      where: { id_provinsi },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, id_provinsi: true, id_kabupaten: true }, // Include Binderbytes city ID
    });
  }

  async createCity(data: Prisma.CityCreateInput) {
    return await prisma.city.create({ data });
  }

  async upsertCity(where: Prisma.CityWhereUniqueInput, create: Prisma.CityCreateInput, update: Prisma.CityUpdateInput) {
    return await prisma.city.upsert({
      where,
      create,
      update,
    });
  }

  // DISTRICT OPERATIONS
  async getDistrictById(id_kecamatan: string) {
    return await prisma.district.findUnique({
      where: { id_kecamatan },
      select: { id: true, name: true, id_kabupaten: true, id_kecamatan: true }, // Include Binderbytes city ID
    });
  }

  async getDistrictsByCity(id_kabupaten: string) {
    return await prisma.district.findMany({
      where: { id_kabupaten },
      orderBy: { name: 'asc' },
    });
  }

  async createDistrict(data: Prisma.DistrictCreateInput) {
    return await prisma.district.create({ data });
  }

  async upsertDistrict(where: Prisma.DistrictWhereUniqueInput, create: Prisma.DistrictCreateInput, update: Prisma.DistrictUpdateInput) {
    return await prisma.district.upsert({
      where,
      create,
      update,
    });
  }

  // SUBDISTRICT OPERATIONS
  async getSubdistrictById(id: string) {
    return await prisma.subdistrict.findUnique({
      where: { id },
      include: { district: { include: { city: { include: { province: true } } } } },
    });
  }

  async getSubdistrictsByDistrict(id_kecamatan: string) {
    return await prisma.subdistrict.findMany({
      where: { id_kecamatan },
      orderBy: { name: 'asc' },
    });
  }

  async createSubdistrict(data: Prisma.SubdistrictCreateInput) {
    return await prisma.subdistrict.create({ data });
  }

  async upsertSubdistrict(where: Prisma.SubdistrictWhereUniqueInput, create: Prisma.SubdistrictCreateInput, update: Prisma.SubdistrictUpdateInput) {
    return await prisma.subdistrict.upsert({
      where,
      create,
      update,
    });
  }

  // BULK OPERATIONS
  async deleteAllProvinces() {
    return await prisma.province.deleteMany({});
  }

  async deleteAllCities() {
    return await prisma.city.deleteMany({});
  }

  async deleteAllDistricts() {
    return await prisma.district.deleteMany({});
  }

  async deleteAllSubdistricts() {
    return await prisma.subdistrict.deleteMany({});
  }
}
