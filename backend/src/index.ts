import dotenv from 'dotenv';
// Load env vars
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes';
import shippingRoutes from './routes/shippingRoutes';
connectDB();

const app = express();

app.use((req: Request, res: Response, next: any) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'SGB Workflow API', version: '1.0.0' });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  console.log(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('[CRITICAL ERROR]', err);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SGB] Server running on port ${PORT}`);
});
