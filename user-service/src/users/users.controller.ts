import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard, Roles } from './jwt-auth.guard';
import MongooseClassSerializerInterceptor from "./mongoose-class-serializer.interceptor";
import { User, Address } from "./schema/users.schema";
import { UserResponseDto } from "./dto/user-response.dto";
import { CreateAddressDto } from "./dto/address-create.dto";
import { UpdateAddressDto } from "./dto/address-update.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { AddressResponseDto } from "./dto/address-response.dto";

@Controller('/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // Register
    @Post('register')
    async register(@Body() dto: CreateUserDto): Promise<String> {
        return this.usersService.register(dto);
    }

    // Login
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.usersService.login(dto);
    }

    // --- Password Reset ---
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<string> {
        return this.usersService.forgotPassword(forgotPasswordDto);
    }

    @Post('reset-password/:token')
    async resetPassword(
        @Param('token') token: string,
        @Body() resetPasswordDto: ResetPasswordDto
    ): Promise<string> {
        return this.usersService.resetPassword(token, resetPasswordDto);
    }

    // Update own profile
    @Put('profile/update')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
        return this.usersService.update(req.user.sub, dto);
    }

    // Update user by ID (Admin only)
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @Roles('admin')
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    // Get user profile by token
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(MongooseClassSerializerInterceptor(UserResponseDto))
    async getProfile(@Req() req): Promise<User> {
        // req.user.sub contains the user id from the token payload
        return this.usersService.findById(req.user.sub);
    }

    // --- Address Management ---
    @Get('profile/addresses')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(MongooseClassSerializerInterceptor(AddressResponseDto))
    async getAddresses(@Req() req): Promise<Address[]> {
        return this.usersService.getAddresses(req.user.sub);
    }

    @Post('profile/addresses')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(MongooseClassSerializerInterceptor(AddressResponseDto))
    async addAddress(@Req() req, @Body() createAddressDto: CreateAddressDto): Promise<Address> {
        return this.usersService.addAddress(req.user.sub, createAddressDto);
    }

    @Put('profile/addresses/:addressId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(MongooseClassSerializerInterceptor(AddressResponseDto))
    async updateAddress(
        @Req() req,
        @Param('addressId') addressId: string,
        @Body() updateAddressDto: UpdateAddressDto
    ): Promise<Address> {
        return this.usersService.updateAddress(req.user.sub, addressId, updateAddressDto);
    }

    @Delete('profile/addresses/:addressId')
    @UseGuards(JwtAuthGuard)
    async removeAddress(@Req() req, @Param('addressId') addressId: string): Promise<string> {
        return this.usersService.removeAddress(req.user.sub, addressId);
    }

    @Put('profile/addresses/:addressId/default')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(MongooseClassSerializerInterceptor(AddressResponseDto))
    async setDefaultAddress(@Req() req, @Param('addressId') addressId: string): Promise<Address> {
        return this.usersService.setDefaultAddress(req.user.sub, addressId);
    }

    // Delete user profile by token
    @Delete('profile')
    @UseGuards(JwtAuthGuard)
    async deleteProfile(@Req() req) {
        return this.usersService.delete(req.user.sub);
    }

    // Delete user by id (Admin only)
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @Roles('admin')
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

    // Get all users (Admin only)
    @Get('/all')
    @UseGuards(JwtAuthGuard)
    @Roles('admin')
    @UseInterceptors(MongooseClassSerializerInterceptor(UserResponseDto))
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    // Get user by id (Admin only)
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @Roles('admin')
    @UseInterceptors(MongooseClassSerializerInterceptor(UserResponseDto))
    async findById(@Param('id') id: string): Promise<User> {
        return this.usersService.findById(id);
    }

    // Get user addresses for internal service communication
    @Get(':id/internal/addresses')
    @UseInterceptors(MongooseClassSerializerInterceptor(AddressResponseDto))
    async getAddressesForService(@Param('id') id: string): Promise<Address[]> {
        return this.usersService.getAddresses(id);
    }
}