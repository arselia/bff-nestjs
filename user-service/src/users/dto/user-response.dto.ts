import { Expose, Type } from 'class-transformer';
import { AddressResponseDto } from './address-response.dto';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  fullname: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  @Type(() => AddressResponseDto)
  addresses: AddressResponseDto[];
}
