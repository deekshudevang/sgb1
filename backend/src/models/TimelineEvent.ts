import mongoose, { Schema, Document } from 'mongoose';

export interface ITimelineEvent extends Document {
  order_id: mongoose.Types.ObjectId;
  action: string; 
  status_from?: string;
  status_to: string;
  notes?: string;
  createdAt: Date;
}

const timelineEventSchema = new Schema({
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  status_from: {
    type: String,
  },
  status_to: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

export const TimelineEvent = mongoose.model<ITimelineEvent>('TimelineEvent', timelineEventSchema);
