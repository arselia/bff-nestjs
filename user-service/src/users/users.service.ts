import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { User, UserDocument, Address } from "./schema/users.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.dto";
import { CreateAddressDto } from "./dto/address-create.dto";
import { UpdateAddressDto } from "./dto/address-update.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import * as crypto from 'crypto';

@Injectable()
export class UsersService{
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // Register / Create Acc
  async register(dto: CreateUserDto): Promise<string> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: dto.email },
        { username: dto.username },
      ]
    });

    if (existingUser) {
      throw new BadRequestException('Username atau email sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = new this.userModel({
      ...dto,
      password: hashedPassword,
    });

    await newUser.save();
    return 'Akun berhasil dibuat, silakan login';
  }

  // Login
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) throw new UnauthorizedException('Email atau password salah');

    if (user.loginAttempts >= 3) {
      throw new UnauthorizedException('Akun diblokir karena terlalu banyak gagal login. Hubungi admin.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      await user.save();
      throw new UnauthorizedException('Email atau password salah');
    }

    user.loginAttempts = 0;
    await user.save();

    const payload = { sub: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });

    return { token };
  }


  // Update 
  async update(id: string, dto: UpdateUserDto): Promise<string> {
    const user = await this.userModel.findById(id).select('+password');
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // Update data biasa (email diskip, gak bisa diubah)
    if (dto.username && dto.username !== user.username) {
      const exists = await this.userModel.findOne({ username: dto.username });
      if (exists) throw new BadRequestException('Username sudah digunakan');
      user.username = dto.username;
    }

    if (dto.fullname) user.fullname = dto.fullname;
    if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;

    // Update password
    if (dto.oldPassword || dto.newPassword) {
      if (!dto.oldPassword || !dto.newPassword) {
        throw new BadRequestException('Harap isi Password Lama dan Password Baru untuk mengganti Password.');
      }

      const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
      if (!isMatch) throw new UnauthorizedException('Password lama salah');

      user.password = await bcrypt.hash(dto.newPassword, 10);
    }

    await user.save();
    return 'User berhasil diperbarui';
  }

  // Delete 
  async delete(id: string): Promise<string> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException('User tidak ditemukan');

    return 'Akun berhasil dihapus';
  }

  // Mendapatkan semua akun 
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
    
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User tidak ditemukan');

    return user;
  }

  // --- Address Management ---

  async getAddresses(userId: string): Promise<Address[]> {
    const user = await this.userModel.findById(userId, { addresses: 1 }).lean();
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user.addresses;
  }

  async addAddress(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const { street, city, province } = createAddressDto;
    const isDuplicate = user.addresses.some(
      addr =>
        addr.street.toLowerCase() === street.toLowerCase() &&
        addr.city.toLowerCase() === city.toLowerCase() &&
        addr.province.toLowerCase() === province.toLowerCase(),
    );

    if (isDuplicate) {
      throw new BadRequestException('Alamat ini sudah terdaftar di akun Anda.');
    }

    if (createAddressDto.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    user.addresses.push(createAddressDto as any);
    await user.save(); // Save before returning
    return user.addresses[user.addresses.length - 1]; // Return the newly added address
  }

  async updateAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    if (!updateAddressDto || Object.keys(updateAddressDto).length === 0) {
      throw new BadRequestException('Tidak ada data yang diberikan untuk memperbarui alamat.');
    }

    const userWithAddresses = await this.userModel.findById(userId);
    if (!userWithAddresses) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Check for duplicates before updating
    if (updateAddressDto.street && updateAddressDto.city && updateAddressDto.province) {
      const isDuplicate = userWithAddresses.addresses.some(
        addr =>
          addr._id.toString() !== addressId && // Exclude the address being updated
          addr.street.toLowerCase() === updateAddressDto.street!.toLowerCase() &&
          addr.city.toLowerCase() === updateAddressDto.city!.toLowerCase() &&
          addr.province.toLowerCase() === updateAddressDto.province!.toLowerCase(),
      );

      if (isDuplicate) {
        throw new BadRequestException('Alamat ini sudah terdaftar di akun Anda.');
      }
    }

    // If the update includes setting an address as default, handle it first.
    if (updateAddressDto.isDefault === true) {
      await this.userModel.updateOne(
          { _id: userId },
          { $set: { 'addresses.$[].isDefault': false } }
      );
    }
  
    // Create the $set object dynamically for atomic update
    const updateFields = {};
    for (const key in updateAddressDto) {
      if (Object.prototype.hasOwnProperty.call(updateAddressDto, key)) {
        updateFields[`addresses.$[elem].${key}`] = updateAddressDto[key];
      }
    }
  
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId }, // Query only for the user
      { $set: updateFields },
      { 
        new: true, 
        runValidators: true,
        arrayFilters: [{ 'elem._id': addressId }] // <-- ADD THIS arrayFilters
      }
    );
  
    if (!user) {
      // To provide a more specific error, check if the user or the address was not found
      const userExists = await this.userModel.findById(userId);
      if (!userExists) throw new NotFoundException('User tidak ditemukan');
      throw new NotFoundException('Alamat tidak ditemukan');
    }
  
    const updatedAddress = user.addresses.find(addr => addr._id.toString() === addressId);
    if (!updatedAddress) {
      throw new NotFoundException('Gagal menemukan alamat yang diperbarui setelah operasi update.');
    }
    return updatedAddress;
  }

  async removeAddress(userId: string, addressId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new NotFoundException('User tidak ditemukan.');
    }

    const addressToDelete = user.addresses.id(addressId); // Use .id() for sub-document
    if (!addressToDelete) {
        throw new NotFoundException('Alamat tidak ditemukan.');
    }

    if (addressToDelete.isDefault) {
        throw new BadRequestException('Alamat default tidak dapat dihapus. Harap setel alamat lain sebagai default terlebih dahulu.');
    }

    // Proceed with deletion if not default
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } }
    );

    if (result.modifiedCount === 0) {
      // This case should ideally not be hit if addressToDelete was found,
      // but keeping it for robustness.
      throw new NotFoundException('Gagal menghapus alamat. Mungkin alamat tidak ditemukan.');
    }
    
    return 'Alamat berhasil dihapus.';
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    // First, set all addresses to not be the default
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { 'addresses.$[].isDefault': false } }
    );
  
    // Then, set the specified address as the default
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId, 'addresses._id': addressId },
      { $set: { 'addresses.$.isDefault': true } },
      { new: true }
    );
  
    if (!user) {
      throw new NotFoundException('User atau alamat tidak ditemukan.');
    }
  
    const updatedAddress = user.addresses.find(addr => addr._id.toString() === addressId);
    if (!updatedAddress) {
      throw new NotFoundException('Gagal menemukan alamat yang diperbarui setelah operasi update.');
    }
    return updatedAddress;
  }

  // --- Password Reset ---

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email });
    if (!user) {
      // Respon ambigu untuk keamanan
      return 'Jika email Anda terdaftar, Anda akan menerima email reset password.';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    await user.save();

    const resetUrl = `http://localhost:8001/users/reset-password/${resetToken}`;
    
    console.log('====================================================');
    console.log('== SIMULASI PENGIRIMAN EMAIL PASSWORD RESET ==');
    console.log('====================================================');
    console.log(`Penerima: ${user.email}`);
    console.log(`Subjek:   Reset Password Akun Anda`);
    console.log(`\nSilakan gunakan link berikut untuk mereset password Anda:`);
    console.log(resetUrl);
    console.log('====================================================');

    return 'Jika email Anda terdaftar, Anda akan menerima email reset password.';
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<string> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw new BadRequestException('Token reset password tidak valid atau sudah kedaluwarsa.');
    }

    user.password = await bcrypt.hash(resetPasswordDto.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return 'Password berhasil direset. Silakan login dengan password baru Anda.';
  }
}