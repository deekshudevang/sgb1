import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  product_details: string;
  status: 'ORDER_CREATED' | 'PACKED' | 'SHIPPED' | 'DELIVERED';
  courier_name?: string;
  tracking_id?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema({
  customer_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  delivery_address: { type: String, required: true },
  product_details: { type: String, required: true },
  
  status: {
    type: String,
    enum: ['ORDER_CREATED', 'PACKED', 'SHIPPED', 'DELIVERED'],
    default: 'ORDER_CREATED',
  },
  
  courier_name: { type: String },
  tracking_id: { type: String },
  notes: { type: String },
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
