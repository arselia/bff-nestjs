import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAddressDto {
    @IsString()
    @IsOptional()
    label?: string;
  
    @IsString()
    @IsOptional()
    recipientName?: string;
  
    @IsString()
    @IsOptional()
    phoneNumber?: string;
  
    @IsString()
    @IsOptional()
    street?: string;
  
    @IsString()
    @IsOptional()
    city?: string;
  
    @IsString()
    @IsOptional()
    province?: string;
  
    @IsString()
    @IsOptional()
    postalCode?: string;
  
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
