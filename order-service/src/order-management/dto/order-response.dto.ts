import { Expose, Type } from 'class-transformer';

class ShippingAddressDto {
  @Expose()
  label: string;

  @Expose()
  recipientName: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  street: string;

  @Expose()
  city: string;

  @Expose()
  province: string;

  @Expose()
  postalCode: string;
}

class OrderItemDto {
  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  productImageUrl: string;

  @Expose()
  quantity: number;

  @Expose()
  price: number;
}

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderNumber: string; // Added

  @Expose()
  userId: string;

  @Expose()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @Expose()
  totalAmount: number;

  @Expose()
  status: string;

  @Expose()
  paymentId: string;

  @Expose()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto; // Added

  constructor(partial: Partial<OrderResponseDto>) {
    Object.assign(this, partial);
  }
}
