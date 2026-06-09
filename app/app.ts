import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import addressRoutes from './modules/address/address.routes.js';
import globalErrorHandler from './modules/error/ErrorRequestHandler.js';
import { requestId } from './middleware/request-id.js';
import locationRoutes from './modules/address/location/location.routes.js';
import productRoutes from './modules/product/product.routes.js';
import shippingRoutes from './modules/shipping/shipping.route.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import { buyerRouter, sellerRouter } from './modules/order/order.routes.js';
export const app = express();
import publicProductRoutes from './modules/product/product.public.routes.js';
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? '1');
if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) {
  app.set('trust proxy', trustProxyHops);
}

const corsOptions = {
  origin: ['http://192.168.100.230:3000', 'http://127.0.0.1:3000', 'http://192.168.100.230:5000', 'https://absensi-fe-project.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
};

app.use(express.json({ limit: '16kb' }));
app.use(requestId);
app.use(cors(corsOptions));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/public', publicProductRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', buyerRouter);
app.use('/api/seller/orders', sellerRouter);
app.use(globalErrorHandler);

export default app;
