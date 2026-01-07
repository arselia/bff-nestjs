  import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

  export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    fullname?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    oldPassword?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    newPassword?: string;

    @IsOptional()
    @IsString()
    role?: string;
  }
