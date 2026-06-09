import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { stockMovementCreateSchema, stockMovementListQuerySchema, stockMovementUpdateSchema } from '../product.schema.js';
import { getBody, getUserId } from '../product.http.js';
import { stockMovementService } from '../product.dependencies.js';

type MovementParams = {
  movementId: string;
};

export const createStockMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = parseOrThrow(stockMovementCreateSchema, getBody(req));
    const result = await stockMovementService.createStockMovement(userId, input);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const query = parseOrThrow(stockMovementListQuerySchema, req.query);
    const result = await stockMovementService.listStockMovements(userId, query);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getStockMovementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { movementId } = req.params as MovementParams;
    const result = await stockMovementService.getStockMovementById(userId, movementId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateStockMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { movementId } = req.params as MovementParams;
    const input = parseOrThrow(stockMovementUpdateSchema, getBody(req));
    const result = await stockMovementService.updateStockMovement(userId, movementId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteStockMovement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { movementId } = req.params as MovementParams;
    const result = await stockMovementService.deleteStockMovement(userId, movementId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
