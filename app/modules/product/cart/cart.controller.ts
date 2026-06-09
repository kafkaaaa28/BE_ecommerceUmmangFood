import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { cartItemCreateSchema, cartItemDeleteSchema, cartItemUpdateSchema } from '../product.schema.js';
import { getBody, getUserId } from '../product.http.js';
import { cartService } from '../product.dependencies.js';

type Params = {
  productId: string;
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as Params;
    const input = parseOrThrow(cartItemCreateSchema, getBody(req) ?? {});
    const result = await cartService.addToCart(userId, productId, input.variantId, input.quantity);
    res.status(201).json({
      ok: true,
      message: 'Product added to cart',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as Params;
    const input = parseOrThrow(cartItemUpdateSchema, getBody(req));
    const result = await cartService.updateCartItemQuantity(userId, productId, input.variantId, input.quantity);

    res.status(200).json({
      ok: true,
      message: 'Cart item quantity updated',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as Params;
    const input = parseOrThrow(cartItemDeleteSchema, getBody(req));
    console.log('deleteFromCart input', { userId, productId, variantId: input.variantId });
    await cartService.deleteFromCart(userId, productId, input.variantId);

    res.status(200).json({
      ok: true,
      message: 'Product removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await cartService.getCart(userId);

    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
