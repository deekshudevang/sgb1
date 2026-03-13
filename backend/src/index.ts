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

// Connect to MongoDB
connectDB();

const app = express();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SGB] Server running on port ${PORT}`);
});
