import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  markAsPacked, 
  markAsShipped,
  markAsDelivered,
  exportOrdersCSV
} from '../controllers/orderController';
import { protect, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

// Fetch orders (Based on Role: Admin/Pack/Ship)
router.route('/').get(protect, getOrders);

// Create order (Admin or Order Placement only)
router.route('/').post(protect, requireRole(['ADMIN', 'ORDER_PLACEMENT', 'BILLING']), createOrder);

// Export CSV (Admin only)
router.route('/export/csv').get(protect, requireRole(['ADMIN']), exportOrdersCSV);

// Get single order details
router.route('/:id').get(protect, getOrderById);

// Department Workflow Triggers
router.route('/:id/pack').put(protect, requireRole(['PACKAGING', 'ADMIN']), markAsPacked);
router.route('/:id/ship').put(protect, requireRole(['SHIPMENT', 'ADMIN']), markAsShipped);
router.route('/:id/deliver').put(protect, requireRole(['SHIPMENT', 'ADMIN']), markAsDelivered);

export default router;
