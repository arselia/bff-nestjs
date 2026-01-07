import { Expose, Transform } from 'class-transformer';

export class AddressResponseDto {
  @Expose()
  @Transform(params => params.obj._id.toString())
  id: string;

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

  @Expose()
  isDefault: boolean;
}
