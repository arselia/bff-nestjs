import { Expose } from 'class-transformer';

export class PaymentResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderId: string;

  @Expose()
  userId: string;

  @Expose()
  status: string;

  @Expose()
  method: string;

  constructor(partial: Partial<PaymentResponseDto>) {
    Object.assign(this, partial);
  }
}