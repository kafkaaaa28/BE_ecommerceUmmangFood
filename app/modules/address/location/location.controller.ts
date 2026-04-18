import type { Request, Response, NextFunction } from 'express';
import { LocationService } from './location.service.js';
import { parseOrThrow } from '../../validation/parse.js';
import { z } from 'zod';

const locationService = new LocationService();

// SCHEMAS
const SearchCitiesSchema = z.object({
  q: z.string().min(1, 'Kata kunci pencarian wajib diisi').max(100),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

const ProvinceIdSchema = z.object({
  provinceId: z.string().min(1, 'Province ID wajib diisi'),
});

const CityIdSchema = z.object({
  cityId: z.string().min(1, 'City ID wajib diisi'),
});

const DistrictIdSchema = z.object({
  districtId: z.string().min(1, 'District ID wajib diisi'),
});

// HANDLERS

/**
 * GET /locations/search-cities
 * Autocomplete search untuk mencari kota
 *
 * Query params:
 * - q: string (required) - Kata kunci pencarian
 * - limit: number (optional) - Jumlah hasil (default: 20, max: 100)
 *
 * Response:
 * - id: string (Prisma ID)
 * - cityId: number (RajaOngkir ID)
 * - cityBbId: number | null (Binderbytes ID)
 * - name: string
 * - provinceName: string
 * - provinceId: string
 */
export async function searchCitiesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, limit } = parseOrThrow(SearchCitiesSchema, req.query);

    // const cities = await locationService.searchCities(q, limit);

    res.status(200).json({
      ok: true,
      // data: cities,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /locations/provinces
 * Dapatkan semua provinsi
 *
 * Response:
 * - id: string (Prisma ID)
 * - provinceId: number (RajaOngkir ID)
 * - provinceBbId: number | null (Binderbytes ID)
 * - name: string
 */
export async function getProvincesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const provinces = await locationService.getAllProvinces();

    res.status(200).json({
      ok: true,
      data: provinces,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /locations/cities
 * Dapatkan semua kota berdasarkan provinsi
 *
 * Query params:
 * - provinceId: string (required)
 *
 * Response:
 * - id: string (Prisma ID)
 * - cityId: number (RajaOngkir ID)
 * - cityBbId: number | null (Binderbytes ID)
 * - name: string
 */
export async function getCitiesByProvinceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { provinceId } = parseOrThrow(ProvinceIdSchema, req.query);

    const cities = await locationService.getCitiesByProvince(provinceId);

    res.status(200).json({
      ok: true,
      data: cities,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /locations/districts
 * Dapatkan semua kecamatan berdasarkan kota
 *
 * Query params:
 * - cityId: string (required)
 *
 * Response:
 * - id: string (Prisma ID)
 * - districtId: number (RajaOngkir ID)
 * - districtBbId: number | null (Binderbytes ID)
 * - name: string
 */
export async function getDistrictsByCityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { cityId } = parseOrThrow(CityIdSchema, req.query);

    const districts = await locationService.getDistrictsByCity(cityId);

    res.status(200).json({
      ok: true,
      data: districts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /locations/subdistricts
 * Dapatkan semua kelurahan berdasarkan kecamatan
 *
 * Query params:
 * - districtId: string (required)
 *
 * Response:
 * - id: string (Prisma ID)
 * - subdistrictId: number (RajaOngkir ID)
 * - subdistrictBbId: number | null (Binderbytes ID)
 * - name: string
 * - postalCode: string | null
 */
export async function getSubdistrictsByDistrictHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { districtId } = parseOrThrow(DistrictIdSchema, req.query);

    const subdistricts = await locationService.getSubdistrictsByDistrict(districtId);

    res.status(200).json({
      ok: true,
      data: subdistricts,
    });
  } catch (error) {
    next(error);
  }
}
