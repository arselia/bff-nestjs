import { Injectable, OnModuleInit, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class BffAdminService implements OnModuleInit {
  userServiceUrl: string;
  productServiceUrl: string;
  orderServiceUrl: string;
  paymentServiceUrl: string;
  private internalSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.userServiceUrl = this.configService.get('USER_SERVICE_URL')!;
    this.productServiceUrl = this.configService.get('PRODUCT_SERVICE_URL')!;
    this.orderServiceUrl = this.configService.get('ORDER_SERVICE_URL')!;
    this.paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL')!;
    this.internalSecret = this.configService.get('INTERNAL_SECRET_KEY')!;

    if (!this.userServiceUrl || !this.productServiceUrl || !this.orderServiceUrl || !this.paymentServiceUrl || !this.internalSecret) {
      throw new Error('One or more service URLs or the internal secret are not defined in the environment variables.');
    }
  }

  private async forwardRequest(config: AxiosRequestConfig) {
    try {
      // Clone existing headers and add the internal secret
      const newHeaders = {
        ...config.headers,
        'X-Internal-Secret': this.internalSecret,
      };

      const response = await lastValueFrom(
        this.httpService.request({ ...config, headers: newHeaders }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'An error occurred',
        error.response?.status || 500,
      );
    }
  }

  // --- Dashboard ---
  async getDashboardData(authHeader: string) {
    const headers = { Authorization: authHeader };
    const allOrdersPromise = this.forwardRequest({ method: 'GET', url: `${this.orderServiceUrl}/orders/all`, headers });
    
    const [totalUsers, totalProducts, allOrders] = await Promise.all([
      this.forwardRequest({ method: 'GET', url: `${this.userServiceUrl}/users/all`, headers }).then(u => (u as any[]).length || 0),
      this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/products`, headers }).then(p => (p as any[]).length || 0),
      allOrdersPromise,
    ]);

    const totalRevenue = (allOrders as any[]).reduce((acc: number, order: any) => acc + (order.totalAmount || 0), 0);

    return {
      totalUsers,
      totalProducts,
      totalOrders: (allOrders as any[]).length,
      totalRevenue,
      recentOrders: (allOrders as any[]).slice(0, 5),
    };
  }

  // --- User Management ---
  getUsers(authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.userServiceUrl}/users/all`, headers: { Authorization: authHeader } });
  }

  getUserById(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.userServiceUrl}/users/${id}`, headers: { Authorization: authHeader } });
  }

  updateUser(id: string, body: any, authHeader: string) {
    return this.forwardRequest({ method: 'PUT', url: `${this.userServiceUrl}/users/${id}`, data: body, headers: { Authorization: authHeader } });
  }

  deleteUser(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'DELETE', url: `${this.userServiceUrl}/users/${id}`, headers: { Authorization: authHeader } });
  }

  getUsersAddresses(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.userServiceUrl}/users/${id}/internal/addresses`, headers: { Authorization: authHeader } });
  }

  // --- Product Management ---
  getProducts(authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/products`, headers: { Authorization: authHeader } });
  }

  getProductById(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/products/${id}`, headers: { Authorization: authHeader } });
  }

  createProduct(body: any, authHeader: string) {
    return this.forwardRequest({ method: 'POST', url: `${this.productServiceUrl}/products`, data: body, headers: { Authorization: authHeader } });
  }

  updateProduct(id: string, body: any, authHeader: string) {
    return this.forwardRequest({ method: 'PUT', url: `${this.productServiceUrl}/products/${id}`, data: body, headers: { Authorization: authHeader } });
  }

  deleteProduct(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'DELETE', url: `${this.productServiceUrl}/products/${id}`, headers: { Authorization: authHeader } });
  }

  updateProductStock(id: string, body: any, authHeader: string) {
    return this.forwardRequest({ method: 'PUT', url: `${this.productServiceUrl}/products/${id}/stock`, data: body, headers: { Authorization: authHeader } });
  }

  getLowStockProducts(authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/products/low-stock`, headers: { Authorization: authHeader } });
  }

  getProductReviews(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/products/${id}/reviews`, headers: { Authorization: authHeader } });
  }

  // --- Category Management ---
  getCategories(authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/categories`, headers: { Authorization: authHeader } });
  }

  createCategory(body: any, authHeader: string) {
    return this.forwardRequest({ method: 'POST', url: `${this.productServiceUrl}/categories`, data: body, headers: { Authorization: authHeader } });
  }

  getCategoryById(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/categories/${id}`, headers: { Authorization: authHeader } });
  }

  updateCategory(id: string, body: any, authHeader: string) {
    return this.forwardRequest({ method: 'PUT', url: `${this.productServiceUrl}/categories/${id}`, data: body, headers: { Authorization: authHeader } });
  }

  deleteCategory(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'DELETE', url: `${this.productServiceUrl}/categories/${id}`, headers: { Authorization: authHeader } });
  }

  getProductsByCategory(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/categories/${id}/products`, headers: { Authorization: authHeader } });
  }

  // --- Order Management ---
  getOrders(authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.orderServiceUrl}/orders/all`, headers: { Authorization: authHeader } });
  }

  getOrderById(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.orderServiceUrl}/orders/internal/${id}`, headers: { Authorization: authHeader } });
  }

  updateOrderStatus(id: string, body: any, authHeader: string) {
    return this.forwardRequest({ method: 'PUT', url: `${this.orderServiceUrl}/orders/${id}/status`, data: body, headers: { Authorization: authHeader } });
  }

  deleteOrder(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'DELETE', url: `${this.orderServiceUrl}/orders/${id}`, headers: { Authorization: authHeader } });
  }

  // --- Payment Management ---
  getPayments(authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.paymentServiceUrl}/payments/all`, headers: { Authorization: authHeader } });
  }

  getPaymentById(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.paymentServiceUrl}/payments/${id}`, headers: { Authorization: authHeader } });
  }

  updatePaymentStatus(id: string, body: any, authHeader: string) {
    return this.forwardRequest({ method: 'PUT', url: `${this.paymentServiceUrl}/payments/${id}/status`, data: body, headers: { Authorization: authHeader } });
  }

  getPaymentStats(authHeader: string) {
    // This would have more complex aggregation logic in a real scenario
    return this.forwardRequest({ method: 'GET', url: `${this.paymentServiceUrl}/payments/all`, headers: { Authorization: authHeader } });
  }

  // --- Review Management ---
  getReviews(authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/products/reviews/all`, headers: { Authorization: authHeader } });
  }

  getReviewById(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'GET', url: `${this.productServiceUrl}/products/reviews/${id}`, headers: { Authorization: authHeader } });
  }

  deleteReview(id: string, authHeader: string) {
    return this.forwardRequest({ method: 'DELETE', url: `${this.productServiceUrl}/products/reviews/${id}`, headers: { Authorization: authHeader } });
  }
}
