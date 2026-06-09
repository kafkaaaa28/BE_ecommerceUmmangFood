import type { Request, Response, NextFunction } from 'express';

import { ShippingService } from './shipping.service.js';
import { getShippingCostSchema } from './shipping.schema.js';
import { parseOrThrow } from '../validation/parse.js';

const shippingService = new ShippingService();

export const getShippingCost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { origin, destination, weight, courier } = req.body;
    const parsed = parseOrThrow(getShippingCostSchema, { origin, destination, weight, courier });
    const costs = await shippingService.getShippingCost({
      origin: parsed.origin,
      destination: parsed.destination,
      weight: parsed.weight,
      courier: parsed.courier,
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan ongkos kirim',
      data: costs,
    });
  } catch (error) {
    next(error);
  }
};
