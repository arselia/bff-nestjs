import { Controller, Get, Post, Put, Delete, Param, Body, Headers } from '@nestjs/common';
import { BffAdminService } from './bff-admin.service';

@Controller()
export class BffAdminController {
  constructor(private readonly bffAdminService: BffAdminService) {}

  // --- Dashboard ---
  @Get('dashboard')
  getDashboard(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getDashboardData(authHeader);
  }

  // --- User Management ---
  @Get('users')
  getUsers(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getUsers(authHeader);
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getUserById(id, authHeader);
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.updateUser(id, body, authHeader);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.deleteUser(id, authHeader);
  }

  @Get('users/:id/addresses')
  getUsersAddresses(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getUsersAddresses(id, authHeader);
  }

  // --- Product Management ---
  @Get('products')
  getProducts(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getProducts(authHeader);
  }

  @Get('products/:id')
  getProductById(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getProductById(id, authHeader);
  }

  @Post('products')
  createProduct(@Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.createProduct(body, authHeader);
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.updateProduct(id, body, authHeader);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.deleteProduct(id, authHeader);
  }

  @Put('products/:id/stock')
  updateProductStock(@Param('id') id: string, @Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.updateProductStock(id, body, authHeader);
  }

  @Get('products/low-stock')
  getLowStockProducts(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getLowStockProducts(authHeader);
  }

  @Get('products/:id/reviews')
  getProductReviews(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getProductReviews(id, authHeader);
  }

  // --- Category Management ---
  @Get('categories')
  getCategories(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getCategories(authHeader);
  }

  @Post('categories')
  createCategory(@Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.createCategory(body, authHeader);
  }

  @Get('categories/:id')
  getCategoryById(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getCategoryById(id, authHeader);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.updateCategory(id, body, authHeader);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.deleteCategory(id, authHeader);
  }

  @Get('categories/:id/products')
  getProductsByCategory(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getProductsByCategory(id, authHeader);
  }

  // --- Order Management ---
  @Get('orders')
  getOrders(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getOrders(authHeader);
  }

  @Get('orders/:id')
  getOrderById(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getOrderById(id, authHeader);
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.updateOrderStatus(id, body, authHeader);
  }

  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.deleteOrder(id, authHeader);
  }

  // --- Payment Management ---
  @Get('payments')
  getPayments(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getPayments(authHeader);
  }

  @Get('payments/:id')
  getPaymentById(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getPaymentById(id, authHeader);
  }

  @Put('payments/:id/status')
  updatePaymentStatus(@Param('id') id: string, @Body() body: any, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.updatePaymentStatus(id, body, authHeader);
  }

  @Get('payments/stats')
  getPaymentStats(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getPaymentStats(authHeader);
  }

  // --- Review Management ---
  @Get('reviews')
  getReviews(@Headers('authorization') authHeader: string) {
    return this.bffAdminService.getReviews(authHeader);
  }

  @Get('reviews/:id')
  getReviewById(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.getReviewById(id, authHeader);
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    return this.bffAdminService.deleteReview(id, authHeader);
  }
}
