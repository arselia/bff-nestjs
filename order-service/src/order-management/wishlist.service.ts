import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WishlistService implements OnModuleInit {
  private productServiceUrl: string;

  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL');
    if (!productServiceUrl) {
      throw new Error('PRODUCT_SERVICE_URL must be defined');
    }
    this.productServiceUrl = productServiceUrl;
  }

  private async validateProduct(productId: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.get(`${this.productServiceUrl}/products/${productId}`));
    } catch (error) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
  }

  async findAllByUser(userId: string): Promise<Wishlist[]> {
    return this.wishlistModel.find({ userId }).exec();
  }

  async findOne(userId: string, id: string): Promise<Wishlist> {
    const wishlist = await this.wishlistModel.findOne({ _id: id, userId }).exec();
    if (!wishlist) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found for this user`);
    }
    return wishlist;
  }

  async create(userId: string, createWishlistDto: CreateWishlistItemDto): Promise<Wishlist> {
    const { productId } = createWishlistDto;
    await this.validateProduct(productId);

    const existingItem = await this.wishlistModel.findOne({ userId, productId }).exec();
    if (existingItem) {
      throw new ConflictException('This item is already in the wishlist.');
    }

    const createdWishlist = new this.wishlistModel({ userId, productId });
    return createdWishlist.save();
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    const result = await this.wishlistModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Wishlist item with ID ${id} not found for this user`);
    }
    return { message: 'Wishlist item successfully deleted' };
  }
}