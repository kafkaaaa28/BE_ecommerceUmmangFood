import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { searchCatalogQuerySchema } from '../product.schema.js';
import { catalogService } from '../product.dependencies.js';

export const searchCatalog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = parseOrThrow(searchCatalogQuerySchema, req.query);
    const result = await catalogService.searchCatalog(query.keyword, query.limit);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
