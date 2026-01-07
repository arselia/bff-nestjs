import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UseGuards, Request, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { MongooseClassSerializerInterceptor } from './mongoose-class-serializer.interceptor';
import { OrderResponseDto } from './dto/order-response.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Order } from './schemas/order.schema';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders')
@UseInterceptors(MongooseClassSerializerInterceptor(OrderResponseDto))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @Get('check-product-purchase')
  async checkProductPurchase(@Request() req, @Query('productId') productId: string) {
    const hasPurchased = await this.orderService.hasUserPurchasedProduct(req.user.id, productId);
    return { hasPurchased };
  }

  @Get('my-orders')
  findAllByUser(@Request() req): Promise<Order[]> {
    return this.orderService.findAllByUser(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get('internal/:id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  findById(@Param('id') id: string): Promise<Order> {
    return this.orderService.findById(id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string): Promise<Order> {
    return this.orderService.findOne(req.user.id, id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  updateStatus(@Param('id') id: string, @Body() { status }: { status: string }): Promise<Order> {
    return this.orderService.updateStatus(id, status);
  }

  @Put(':id/confirm-payment')
  confirmPayment(@Param('id') id: string): Promise<Order> {
    return this.orderService.confirmPayment(id);
  }

  @Put(':id/cancel')
  cancelOrder(@Request() req, @Param('id') id: string): Promise<Order> {
    return this.orderService.cancelOrder(req.user.id, id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  remove(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    return this.orderService.remove(req.user.id, id);
  }
}