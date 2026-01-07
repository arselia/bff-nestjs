import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Product {
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Category;

  @Prop({ default: [] })
  images: string[];

  @Prop({ default: 'active' })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

ProductSchema.virtual('category').get(function () {
  return this.categoryId ? (this.categoryId as any).name : null;
});

ProductSchema.virtual('imageUrl').get(function () {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});