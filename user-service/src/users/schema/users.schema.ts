import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class Address {
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

  @Prop({ default: false })
  isDefault: boolean;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: false })
  fullname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: 0, select: false })
  loginAttempts: number;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Types.DocumentArray<Address>;

  @Prop({ type: String, required: false })
  resetPasswordToken?: string;

  @Prop({ type: Date, required: false })
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

