import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { productCreateSchema, productListQuerySchema, productUpdateSchema } from '../product.schema.js';
import { getBody, getUserId } from '../product.http.js';
import { productService } from '../product.dependencies.js';

type ProductParams = {
  productId: string;
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = parseOrThrow(productCreateSchema, getBody(req));
    const result = await productService.createProduct(userId, input);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const query = parseOrThrow(productListQuerySchema, req.query);
    const result = await productService.listProducts(userId, query);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const publicListProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = parseOrThrow(productListQuerySchema, req.query);
    const result = await productService.publicListProducts(query);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const result = await productService.getProductById(userId, productId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const input = parseOrThrow(productUpdateSchema, getBody(req));
    const result = await productService.updateProduct(userId, productId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as ProductParams;
    const result = await productService.deleteProduct(userId, productId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
