import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
  toObject: {
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
  _id: false, // No separate _id for this sub-document
})
class ShippingAddress {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  recipientName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  province: string;

  @Prop({ required: true })
  postalCode: string;
}

@Schema({
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
  toObject: {
    transform: (doc, ret) => {
      delete ret._id;
    },
  },
  _id: false, // No separate _id for this sub-document
})
class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string; // Added
  
  @Prop()
  productImageUrl: string; // Added

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

@Schema({
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
  toObject: {
    virtuals: true,
  },
})
export class Order {
  @Prop({ unique: true, required: true })
  orderNumber: string; // Added for human-readable order ID

  @Prop({ required: true })
  userId: string;

  @Prop({ type: [OrderItem], required: true }) // Updated to use OrderItem schema
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ default: 'pending', enum: ['pending', 'processing', 'completed', 'cancelled'] })
  status: string;

  @Prop()
  paymentId: string;

  @Prop({ type: ShippingAddress }) // Added ShippingAddress
  shippingAddress: ShippingAddress;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});