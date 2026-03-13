import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password_hash: string;
  role: 'ADMIN' | 'PACKAGING' | 'SHIPMENT' | 'ORDER_PLACEMENT' | 'BILLING';
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'PACKAGING', 'SHIPMENT', 'ORDER_PLACEMENT', 'BILLING'],
    default: 'ADMIN',
  },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password_hash')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash as string, salt);
});

export const User = mongoose.model<IUser>('User', userSchema);
