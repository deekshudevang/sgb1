import { Response } from 'express';
import { Order } from '../models/Order';
import { TimelineEvent } from '../models/TimelineEvent';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendWhatsApp } from '../services/whatsappService';

// Try to import json2csv, fall back gracefully if types missing
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { parse } = require('json2csv');

const logTimelineEvent = async (
  orderId: string,
  previousState: string,
  newState: string,
  userId: string,
  notes = ''
) => {
  await TimelineEvent.create({
    order_id: orderId,
    status_from: previousState,
    status_to: newState,
    action: notes,
  });
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { customer_name, phone_number, delivery_address, product_details } = req.body;

    const order = new Order({
      customer_name,
      phone_number,
      delivery_address,
      product_details,
      status: 'ORDER_CREATED',
    });

    const savedOrder = await order.save();

    await logTimelineEvent(
      savedOrder._id.toString(),
      '',
      'ORDER_CREATED',
      req.user?._id?.toString() || '',
      'Order Placed via Dashboard'
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    let query = {};
    const role = req.user?.role;

    if (role === 'PACKAGING') query = { status: 'ORDER_CREATED' };
    else if (role === 'SHIPMENT') query = { status: { $in: ['PACKED', 'SHIPPED', 'DELIVERED'] } };

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
};

export const markAsPacked = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const prev = order.status;
      order.status = 'PACKED';
      const updatedOrder = await order.save();

      await logTimelineEvent(
        updatedOrder._id.toString(),
        prev,
        'PACKED',
        req.user?._id?.toString() || '',
        'Order packed and ready for courier'
      );
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating packing details' });
  }
};

export const markAsShipped = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courier_name, tracking_id } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      const prev = order.status;
      order.courier_name = courier_name;
      order.tracking_id = tracking_id;
      order.status = 'SHIPPED';

      const updatedOrder = await order.save();

      await logTimelineEvent(
        updatedOrder._id.toString(),
        prev,
        'SHIPPED',
        req.user?._id?.toString() || '',
        `Dispatched via ${courier_name} with tracking ${tracking_id}`
      );

      const message = `Hello ${order.customer_name},\n\nYour order from SGB Agro Industries has been shipped.\n\nCourier: ${courier_name}\nTracking ID: ${tracking_id}\n\nThank you!`;
      console.log(`[OrderController] Triggering shipment WhatsApp notification for ${order.customer_name} at ${order.phone_number}`);
      await sendWhatsApp(order.phone_number, message);

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing shipment' });
  }
};

export const markAsDelivered = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      const prev = order.status;
      order.status = 'DELIVERED';
      const updatedOrder = await order.save();
      await logTimelineEvent(updatedOrder._id.toString(), prev, 'DELIVERED', req.user?._id?.toString() || '', 'Order delivered to customer');
      
      const message = `Hello ${order.customer_name},\n\nGreat news! Your order from SGB Agro Industries has been successfully delivered.\n\nWe hope you are satisfied with your purchase. Thank you for choosing SGB!`;
      console.log(`[OrderController] Triggering delivery WhatsApp notification for ${order.customer_name} at ${order.phone_number}`);
      await sendWhatsApp(order.phone_number, message);
      
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error marking as delivered' });
  }
};

export const exportOrdersCSV = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders available to export' });
    }

    const fields = ['_id', 'customer_name', 'phone_number', 'delivery_address', 'product_details', 'status', 'courier_name', 'tracking_id', 'createdAt'];
    const csvData = parse(orders, { fields });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders_export.csv');
    res.status(200).send(csvData);
  } catch (error) {
    console.error('CSV Export Error', error);
    res.status(500).json({ message: 'Failed to export CSV' });
  }
};
