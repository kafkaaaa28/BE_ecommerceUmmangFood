// src/modules/payment/service/payment.error.ts

export class PaymentError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'PaymentError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}
