import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { inventoryUpdateSchema } from '../product.schema.js';
import { getBody, getUserId } from '../product.http.js';
import { inventoryService } from '../product.dependencies.js';

type VariantParams = {
  variantId: string;
};

export const getInventoryByVariantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { variantId } = req.params as VariantParams;
    const result = await inventoryService.getInventoryByVariantId(userId, variantId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryByVariantId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { variantId } = req.params as VariantParams;
    const input = parseOrThrow(inventoryUpdateSchema, getBody(req));
    const result = await inventoryService.updateInventoryByVariantId(userId, variantId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
