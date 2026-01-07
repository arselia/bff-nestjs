import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '../enum/payment-method.enum';

export class CreatePaymentDto {
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;
}