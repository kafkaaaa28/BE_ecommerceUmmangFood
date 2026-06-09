import type { Request, Response, NextFunction } from 'express';
import { searchSubdistrictSchema, createAddressSchema, updateAddressSchema, createAddressSellerSchema } from './address.schema.js';
import { AddressService } from './address.service.js';
import { parseOrThrow } from '../validation/parse.js';
import { AddressRepository } from './address.repository.js';
const addressRepo = new AddressRepository();
const addressService = new AddressService(addressRepo);
type Params = {
  addressId: string;
};
export const searchSubdistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = parseOrThrow(searchSubdistrictSchema, req.query);
    const data = await addressService.searchSubdistricts(parsed.keyword, parsed.limit);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return next(error);
  }
};
export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const body = req.body.data || req.body;

    const { label, recipientName, phone, provinceId, cityId, jalan, detail, provinsi, kota, kecamatan, kelurahan, kodePos, districtId, subdistrictId } = body;
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const input = parseOrThrow(createAddressSchema, { label, recipientName, phone, provinceId, cityId, jalan, detail, provinsi, kota, kecamatan, kelurahan, kodePos, districtId, subdistrictId });
    const result = await addressService.createAddress(userId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const getAddressByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const result = await addressService.getAddressByUserId(userId);

    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params as Params;
    const body = req.body.data || req.body;
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    if (!addressId) {
      return res.status(400).json({ ok: false, message: 'Address ID diperlukan' });
    }

    const input = parseOrThrow(updateAddressSchema, body);
    const result = await addressService.updateAddress(addressId, userId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params as Params;
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    if (!addressId) {
      return res.status(400).json({ ok: false, message: 'Address ID diperlukan' });
    }

    const result = await addressService.deleteAddress(addressId, userId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const createAddressSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body.data || req.body;
    const role = req.user?.role;
    const { districtId, label, storeName } = body;
    if (!role) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const input = parseOrThrow(createAddressSellerSchema, { districtId, label, storeName });
    const result = await addressService.createAddressSeller(input, role);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export const getAddressSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await addressService.getAddressSeller();
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
