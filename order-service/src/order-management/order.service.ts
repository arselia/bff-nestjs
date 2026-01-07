import { Injectable, NotFoundException, BadRequestException, HttpException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CartService } from './cart.service';
import { firstValueFrom } from 'rxjs';
import { Cart } from './schemas/cart.schema';

@Injectable()
export class OrderService implements OnModuleInit {
  private productServiceUrl: string;
  private userServiceUrl: string;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const productServiceUrl = this.configService.get<string>('PRODUCT_SERVICE_URL');
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');

    if (!productServiceUrl || !userServiceUrl) {
      throw new Error('PRODUCT_SERVICE_URL and USER_SERVICE_URL must be defined');
    }

    this.productServiceUrl = productServiceUrl;
    this.userServiceUrl = userServiceUrl;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).exec();
  }

  async findById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findOne(userId: string, id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({ _id: id, userId: userId }).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const order = await this.orderModel.findOne({
      userId,
      'items.productId': productId,
      status: 'completed',
    });
    return !!order;
  }

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { shippingAddressId } = createOrderDto;

    // 1. Get all cart items for the user
    const cartItems = await this.cartService.findAllByUser(userId);
    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty. Cannot create an order.');
    }

    // 2. Fetch product details and construct order items with snapshot data
    const orderItemsPromises = cartItems.map(async (cartItem) => {
      const product = await this.getProductDetails(cartItem.productId);
      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(`Insufficient stock for product: ${product.name}`);
      }
      return {
        productId: cartItem.productId,
        productName: product.name,
        productImageUrl: product.imageUrl,
        quantity: cartItem.quantity,
        price: cartItem.price, // Use the locked price from the cart
      };
    });

    const orderItems = await Promise.all(orderItemsPromises);
    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3. Fetch shipping address snapshot
    const shippingAddress = await this.getUserAddress(userId, shippingAddressId);

            // 4. Create the new order
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
            const orderNumber = `ORD-${year}${month}${day}-${randomString}`;
    
            const newOrder = new this.orderModel({
              orderNumber, // Assign the generated order number
              userId,
              items: orderItems,
              totalAmount,
              shippingAddress: {
                label: shippingAddress.label,
                recipientName: shippingAddress.recipientName,
                phoneNumber: shippingAddress.phoneNumber,
                street: shippingAddress.street,
                city: shippingAddress.city,
                province: shippingAddress.province,
                postalCode: shippingAddress.postalCode,
              },
              status: 'pending',
            });
    const savedOrder = await newOrder.save();

    // 5. Atomically update stock and clear the cart
    await Promise.all([
      ...cartItems.map(item => this.updateProductStock(item.productId, item.quantity, 'decrease')),
      this.cartService.clearCart(userId),
    ]);

    return savedOrder;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    // Admin operation, find by ID only
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BadRequestException(`Order with status '${order.status}' cannot be updated.`);
    }

    // If order is cancelled, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await this.updateProductStock(item.productId, item.quantity, 'increase');
      }
    }

    order.status = status;
    try {
      return await order.save();
    } catch (error) {
      if (error.name === 'ValidationError' && error.errors.status) {
        const validStatuses = error.errors.status.properties.enumValues.join(', ');
        throw new BadRequestException(`'${status}' is not a valid status. Allowed values are: ${validStatuses}.`);
      }
      // Re-throw other errors
      throw error;
    }
  }

  async confirmPayment(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status !== 'pending') {
      throw new BadRequestException(`Only orders with 'pending' status can be confirmed. Current status: '${order.status}'.`);
    }

    order.status = 'processing';
    return order.save();
  }

  async cancelOrder(userId: string, id: string): Promise<Order> {
    const order = await this.findOne(userId, id);

    if (order.status === 'completed' || order.status === 'cancelled') {
      throw new BadRequestException(`Order with status '${order.status}' cannot be cancelled.`);
    }

    // Restore stock for all items in the order
    for (const item of order.items) {
      await this.updateProductStock(item.productId, item.quantity, 'increase');
    }

    order.status = 'cancelled';
    return order.save();
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    // Admin operation, delete by ID only
    const res = await this.orderModel.deleteOne({ _id: id }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return { message: 'Order successfully deleted' };
  }

  private async validateProduct(productId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productServiceUrl}/products/${productId}`),
      );
      return response.data;
    } catch (error) {
        throw new NotFoundException(`Product with ID ${productId} not found or product-service is down.`);
    }
  }

  private async getProductDetails(productId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productServiceUrl}/products/${productId}`),
      );
      return response.data;
    } catch (error) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }
  }

  private async getUserAddress(userId: string, addressId?: string): Promise<any> {
    try {
      // 1. Fetch the user's addresses from the new internal endpoint
      const response = await firstValueFrom(
        this.httpService.get(`${this.userServiceUrl}/users/${userId}/internal/addresses`),
      );
      const addresses = response.data;

      if (!addresses || addresses.length === 0) {
        throw new BadRequestException('No addresses found for the user.');
      }

      // 2. Find the requested address
      let address;
      if (addressId) {
        address = addresses.find(addr => addr.id === addressId); // Use 'id' virtual property
        if (!address) {
          throw new NotFoundException(`Address with ID ${addressId} not found for this user.`);
        }
      } else {
        address = addresses.find(addr => addr.isDefault);
        if (!address) {
          throw new BadRequestException('No default shipping address found for the user.');
        }
      }
      return address;

    } catch (error) {
      if (error.response) {
        // Re-throw the actual error from the downstream service
        throw new HttpException(error.response.data, error.response.status);
      }
      console.error('Error fetching user address:', error.message);
      throw new BadRequestException('Failed to retrieve user address.');
    }
  }

  private async updateProductStock(productId: string, quantity: number, type: 'increase' | 'decrease'): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.put(`${this.productServiceUrl}/products/${productId}/internal/stock`, { quantity, type }),
      );
    } catch (error) {
      // If stock update fails, we must throw an error to prevent inconsistent data
      console.error(`Critical: Failed to update stock for product ${productId}`, error.response?.data || error.message);
      throw new HttpException('Failed to update product stock.', error.response?.status || 500);
    }
  }
}