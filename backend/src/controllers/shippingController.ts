import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { sendWhatsApp } from '../services/whatsappService';

/**
 * Aligned with Tutorial Part 11
 * Handles order shipping and automated WhatsApp notification
 */
export const shipOrder = async (req: Request, res: Response): Promise<void> => {
  const { orderId, courier, trackingId } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Update individual fields as per tutorial logic
    order.status = "SHIPPED";
    order.courier_name = courier;
    order.tracking_id = trackingId;

    await order.save();

    const message = `Hello ${order.customer_name},\n\nYour order from SGB Agro Industries has been shipped.\n\nCourier: ${courier}\nTracking ID: ${trackingId}\n\nThank you!`;

    console.log(`[ShippingController] Dispatching WhatsApp for order ${orderId} to ${order.phone_number}`);
    
    // Aligned with Tutorial logic, but using the robust service
    await sendWhatsApp(order.phone_number, message);

    res.json({ message: "Order shipped and notification sent" });

  } catch (error) {
    console.error("[ShippingController] Error:", error);
    res.status(500).json({ error: "Shipping failed" });
  }
};
