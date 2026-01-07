import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from '../enum/payment-status.enum';

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;
}
