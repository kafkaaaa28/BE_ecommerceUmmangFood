import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { productMediaCreateSchema, productMediaUpdateSchema, productMediaUploadSchema } from '../product.schema.js';
import { getBody, getUserId } from '../product.http.js';
import { productMediaService } from '../product.dependencies.js';

type ProductParams = {
  productId: string;
};

type MediaParams = {
  mediaId: string;
};

export const createProductMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const input = parseOrThrow(productMediaCreateSchema, getBody(req));
    const result = await productMediaService.createProductMedia(userId, productId, input);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listProductMediaByProductId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const result = await productMediaService.listProductMediaByProductId(userId, productId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductMediaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { mediaId } = req.params as MediaParams;
    const result = await productMediaService.getProductMediaById(userId, mediaId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateProductMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { mediaId } = req.params as MediaParams;
    const input = parseOrThrow(productMediaUpdateSchema, getBody(req));
    const result = await productMediaService.updateProductMedia(userId, mediaId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteProductMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { mediaId } = req.params as MediaParams;
    const result = await productMediaService.deleteProductMedia(userId, mediaId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const uploadProductMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const input = parseOrThrow(productMediaUploadSchema, req.body);
    const result = await productMediaService.uploadProductMedia(userId, productId, input, req.file);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
