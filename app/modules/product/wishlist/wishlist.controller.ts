import { WishListService } from './wishlist.service.js';
import { getUserId } from '../product.http.js';
import type { NextFunction, Request, Response } from 'express';
import { wishlistService } from '../product.dependencies.js';

type Params = {
  productId: string;
};
export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as Params;
    await wishlistService.addToWishlist(userId, productId);

    res.status(201).json({
      message: 'Product added to wishlist',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params as Params;
    await wishlistService.deleteFromWishlist(userId, productId);
    res.status(200).json({
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await wishlistService.getWishlist(userId);

    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
