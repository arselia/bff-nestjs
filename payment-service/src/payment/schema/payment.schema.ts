import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentMethod } from '../enum/payment-method.enum';
import { PaymentStatus } from '../enum/payment-status.enum';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete (ret as any)._id;
      delete (ret as any).__v;
    },
  },
  toObject: {
    virtuals: true,
  },
})
export class Payment {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;
  
  @Prop({ required: true, enum: PaymentMethod })
  method: PaymentMethod;

  @Prop({ default: PaymentStatus.PENDING, enum: PaymentStatus })
  status: PaymentStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type PaymentDocument = Payment & Document;
export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
