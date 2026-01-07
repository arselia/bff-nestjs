import { Controller, Post, Body, Get, Param, UseGuards, UseInterceptors, Request, UnauthorizedException, Put } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { MongooseClassSerializerInterceptor } from './mongoose-class-serializer.interceptor';
import { Payment } from './schema/payment.schema';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(MongooseClassSerializerInterceptor(PaymentResponseDto))
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req,
  ): Promise<Payment> {
    const userId = req.user.id;
    const authHeader = req.headers.authorization;
    return this.paymentService.create(createPaymentDto, userId, authHeader);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  findAll(): Promise<Payment[]> {
    return this.paymentService.findAll();
  }

  @Get('me')
  async findMyPayments(@Request() req): Promise<Payment[]> {
    const userId = req.user.id;
    return this.paymentService.findMyPayments(userId);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  getStats() {
    return this.paymentService.getStats();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Payment> {
    const userId = req.user.id;
    return this.paymentService.findOne(id, userId, req.user.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  updateStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<Payment> {
    return this.paymentService.updateStatus(id, updatePaymentStatusDto);
  }
}
