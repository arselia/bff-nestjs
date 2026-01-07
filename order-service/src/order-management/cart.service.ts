import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class CartService {
  private productServiceUrl: string;
  private internalSecret: string;

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.productServiceUrl = this.configService.get('PRODUCT_SERVICE_URL')!;
    this.internalSecret = this.configService.get('INTERNAL_SECRET_KEY')!;

    if (!this.productServiceUrl || !this.internalSecret) {
      throw new Error('PRODUCT_SERVICE_URL or INTERNAL_SECRET_KEY is not defined in environment variables.');
    }
  }

  private _getInternalRequestConfig(): AxiosRequestConfig {
    return {
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': this.internalSecret,
      },
    };
  }

  private async validateProductStock(productId: string, quantity: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.productServiceUrl}/products/${productId}`,
          this._getInternalRequestConfig(),
        ),
      );
      const product = response.data;

      if (product.stock < quantity) {
        throw new BadRequestException(`Insufficient stock for product ${productId}`);
      }
      return product; // Return the product data
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      // Forward the actual error if possible
      const errorMessage = error.response?.data?.message || 'Failed to validate product stock.';
      throw new BadRequestException(errorMessage);
    }
  }

  async findAllByUser(userId: string): Promise<CartDocument[]> {
    if (!userId) {
      throw new BadRequestException('User ID must be provided.');
    }
    return this.cartModel.find({ userId }).exec();
  }

  async findOne(userId: string, id: string): Promise<CartDocument> {
    const cart = await this.cartModel.findOne({ _id: id, userId }).exec();
    if (!cart) {
      throw new NotFoundException(`Cart item with ID ${id} not found for this user`);
    }
    return cart;
  }

  async create(userId: string, createCartDto: CreateCartItemDto): Promise<CartDocument> {
    const { productId, quantity } = createCartDto;

    // Validate product
    const product = await this.validateProductStock(productId, quantity);

    // Check if item already exists in cart
    const existingCartItem = await this.cartModel.findOne({ userId, productId }).exec();

    if (existingCartItem) {
      // If exists, update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      await this.validateProductStock(productId, newQuantity);
      existingCartItem.quantity = newQuantity;
      return existingCartItem.save();
    } else {
      // If not, create new cart item with the locked price
      const createdCart = new this.cartModel({
        userId,
        productId,
        quantity,
        price: product.price, // Lock the price
      });
      return createdCart.save();
    }
  }

  async update(userId: string, id: string, updateCartDto: UpdateCartItemDto): Promise<CartDocument> {
    const { quantity } = updateCartDto;

    if (quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1.');
    }

    const cartItem = await this.findOne(userId, id);

    // Validate stock for the new quantity
    await this.validateProductStock(cartItem.productId, quantity);

    const updatedCart = await this.cartModel.findByIdAndUpdate(id, { quantity }, { new: true }).exec();
    if (!updatedCart) {
      throw new NotFoundException(`Cart item with ID ${id} not found`);
    }
    return updatedCart;
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    await this.findOne(userId, id); // Ensures the item belongs to the user
    await this.cartModel.findByIdAndDelete(id).exec();
    return { message: 'Cart item successfully deleted' };
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.deleteMany({ userId }).exec();
  }
}