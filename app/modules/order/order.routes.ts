import { Router } from 'express';
import { requireAccessToken, requireSeller } from '../../middleware/requireInternalToken.js';
import { OrderRepository } from './order.repository.js';
import { OrderService } from './order.service.js';
import {
  createOrderHandler,
  getOrderHandler,
  getSellerOrderHandler,
  listMyOrdersHandler,
  listSellerOrdersHandler,
  updateOrderStatusHandler,
} from './order.controller.js';

const orderRepo = new OrderRepository();
const orderService = new OrderService(orderRepo);

const buyerRouter = Router();
buyerRouter.use(requireAccessToken);

buyerRouter.post('/', createOrderHandler(orderService));
buyerRouter.get('/', listMyOrdersHandler(orderService));
buyerRouter.get('/:orderId', getOrderHandler(orderService));

const sellerRouter = Router();
sellerRouter.use(requireAccessToken, requireSeller);
sellerRouter.get('/', listSellerOrdersHandler(orderService));
sellerRouter.get('/:orderId', getSellerOrderHandler(orderService));
sellerRouter.patch('/:orderId/status', updateOrderStatusHandler(orderService));

export { buyerRouter, sellerRouter };
