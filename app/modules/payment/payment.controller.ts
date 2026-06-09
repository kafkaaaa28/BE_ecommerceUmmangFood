import type { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDto } from './dto/payment.dto.js';
import { PaymentRepository } from './payment.repository.js';
import { parseOrThrow } from '../validation/parse.js';

const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository);

export const createSnapToken = async (req: Request, res: Response) => {
  const parsed = parseOrThrow(CreatePaymentDto, req.body);

  const orderId = parsed.orderId;
  const { id: buyerId } = req.user!;

  const result = await paymentService.createSnapToken(orderId, buyerId);

  res.status(200).json({
    ok: true,
    data: result,
  });
};
