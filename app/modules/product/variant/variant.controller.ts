import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { variantCreateSchema, variantUpdateSchema } from '../product.schema.js';
import { getBody, getUserId } from '../product.http.js';
import { variantService } from '../product.dependencies.js';

type ProductParams = {
  productId: string;
};

type VariantParams = {
  variantId: string;
};

export const createVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const input = parseOrThrow(variantCreateSchema, getBody(req));
    const result = await variantService.createVariant(userId, productId, input);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listVariantsByProductId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const result = await variantService.listVariantsByProductId(userId, productId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getVariantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { variantId } = req.params as VariantParams;
    const result = await variantService.getVariantById(userId, variantId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { variantId } = req.params as VariantParams;
    const input = parseOrThrow(variantUpdateSchema, getBody(req));
    const result = await variantService.updateVariant(userId, variantId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { variantId } = req.params as VariantParams;
    const result = await variantService.deleteVariant(userId, variantId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
