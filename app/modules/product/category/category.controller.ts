import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../../validation/parse.js';
import { categoryCreateSchema, categoryUpdateSchema } from '../product.schema.js';
import { getBody, getUserId } from '../product.http.js';
import { categoryService } from '../product.dependencies.js';

type CategoryParams = {
  categoryId: string;
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const input = parseOrThrow(categoryCreateSchema, getBody(req));
    const result = await categoryService.createCategory(userId, input);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const result = await categoryService.listCategories(userId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { categoryId } = req.params as CategoryParams;
    const result = await categoryService.getCategoryById(userId, categoryId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { categoryId } = req.params as CategoryParams;
    const input = parseOrThrow(categoryUpdateSchema, getBody(req));
    const result = await categoryService.updateCategory(userId, categoryId, input);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { categoryId } = req.params as CategoryParams;
    const result = await categoryService.deleteCategory(userId, categoryId);
    res.status(200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
