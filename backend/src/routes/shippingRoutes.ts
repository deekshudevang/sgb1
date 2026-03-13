import express from 'express';
import { shipOrder } from '../controllers/shippingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Aligned with Tutorial Part 12
// Note: Adding 'protect' middleware to ensure security, though tutorial didn't specify it
router.post("/ship", protect, shipOrder);

export default router;
