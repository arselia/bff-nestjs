import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schema/payment.schema';
import { Model } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PaymentStatus } from './enum/payment-status.enum';

@Injectable()
export class PaymentService {
  private readonly orderServiceUrl = 'http://localhost:8002';

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly httpService: HttpService,
  ) {}

  private async validateOrder(orderId: string, authHeader: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.orderServiceUrl}/orders/${orderId}`, {
          headers: { Authorization: authHeader },
        }),
      );
      return response.data;
    } catch (error) {
      throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);
    }
  }

  async create(dto: CreatePaymentDto, userId: string, authHeader: string): Promise<Payment> {
    const order = await this.validateOrder(dto.orderId, authHeader);

    if (order.userId !== userId) {
      throw new BadRequestException('Anda tidak dapat membuat pembayaran untuk pesanan milik pengguna lain.');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('Pesanan sudah dibayar atau sedang diproses');
    }

    const payment = new this.paymentModel({ ...dto, userId, amount: order.totalAmount });
    let savedPayment = await payment.save();

    await this.confirmOrderPayment(dto.orderId, authHeader);

    savedPayment.status = PaymentStatus.SUCCESS;
    const finalPayment = await savedPayment.save();

    return finalPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().exec();
  }

  async findMyPayments(userId: string): Promise<Payment[]> {
    const payments = await this.paymentModel.find({ userId }).exec();
    if (!payments || payments.length === 0) {
      throw new NotFoundException('Tidak ada pembayaran untuk user ini');
    }
    return payments;
  }

  async findOne(id: string, userId: string, userRole: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }

    // If the user is an Admin (case-insensitive), grant access immediately.
    if (userRole && userRole.toLowerCase() === 'admin') {
      return payment;
    }

    // If not an Admin, check if the user is the owner of the payment.
    if (payment.userId !== userId) {
      throw new BadRequestException('Anda tidak memiliki akses ke pembayaran ini');
    }
    
    return payment;
  }

  async updateStatus(id: string, updatePaymentStatusDto: UpdatePaymentStatusDto): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }

    // Add business logic protection
    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      throw new BadRequestException(`Pembayaran dengan status '${payment.status}' tidak dapat diubah lagi.`);
    }

    payment.status = updatePaymentStatusDto.status;
    return payment.save();
  }

  async getStats(): Promise<any> {
    const stats = await this.paymentModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }, // Assuming you add an 'amount' field to the payment schema
          totalTransactions: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalTransactions: 1,
        },
      },
    ]);

    const methods = await this.paymentModel.aggregate([
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          method: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return {
      ...stats[0],
      methods,
    };
  }

  private async confirmOrderPayment(orderId: string, authHeader: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.orderServiceUrl}/orders/${orderId}/confirm-payment`,
          {}, // No body needed for this specific endpoint
          { headers: { Authorization: authHeader } },
        ),
      );
    } catch (error) {
      console.error(`Gagal konfirmasi pembayaran untuk order ${orderId}`, error.response?.data);
      throw new BadRequestException('Gagal mengkonfirmasi pembayaran pesanan.');
    }
  }
}
