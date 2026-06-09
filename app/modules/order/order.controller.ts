import type { NextFunction, Request, Response } from 'express';
import { parseOrThrow } from '../validation/parse.js';
import { createOrderSchema, orderListQuerySchema, updateOrderStatusSchema } from './order.schema.js';
import type { OrderService } from './order.service.js';

export function createOrderHandler(orderService: OrderService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buyerId = req.user!.id;
      const input = parseOrThrow(createOrderSchema, req.body);
      const result = await orderService.createOrder(buyerId, input);
      res.status(201).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export function getOrderHandler(orderService: OrderService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buyerId = req.user!.id;
      const { orderId } = req.params as { orderId: string };
      const result = await orderService.getOrder(orderId, buyerId);
      res.status(200).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export function listMyOrdersHandler(orderService: OrderService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const buyerId = req.user!.id;
      const query = parseOrThrow(orderListQuerySchema, req.query);
      const result = await orderService.listMyOrders(buyerId, query.status, query.page, query.limit, query.search);
      res.status(200).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export function listSellerOrdersHandler(orderService: OrderService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = req.user!.id;
      const query = parseOrThrow(orderListQuerySchema, req.query);
      const result = await orderService.listSellerOrders(sellerId, query.status, query.page, query.limit, query.search);
      res.status(200).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export function getSellerOrderHandler(orderService: OrderService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = req.user!.id;
      const { orderId } = req.params as { orderId: string };
      const result = await orderService.getSellerOrder(orderId, sellerId);
      res.status(200).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export function updateOrderStatusHandler(orderService: OrderService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellerId = req.user!.id;
      const { orderId } = req.params as { orderId: string };
      const { status } = parseOrThrow(updateOrderStatusSchema, req.body);
      const result = await orderService.updateOrderStatus(orderId, sellerId, status);
      res.status(200).json({ ok: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
