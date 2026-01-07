import { Controller, Get, Headers, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { BffService } from './bff.service';

@Controller()
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @Get('dashboard')
  async getDashboard(@Headers('Authorization') authHeader: string) {
    return this.bffService.getUserDashboard(authHeader);
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.bffService.getProductById(id);
  }

  @Post('products/:productId/reviews')
  async createReview(
    @Headers('Authorization') authHeader: string,
    @Param('productId') productId: string,
    @Body() createReviewDto: { rating: number; comment: string },
  ) {
    return this.bffService.createReview(authHeader, productId, createReviewDto);
  }

  @Get('cart')
  async getCart(@Headers('Authorization') authHeader: string) {
    return this.bffService.getCart(authHeader);
  }

  @Post('cart/items')
  async addToCart(
    @Headers('Authorization') authHeader: string,
    @Body() addToCartDto: { productId: string, quantity: number },
  ) {
    return this.bffService.addToCart(authHeader, addToCartDto);
  }

  @Put('cart/items/:itemId')
  async updateCartItem(
    @Headers('Authorization') authHeader: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: { quantity: number },
  ) {
    return this.bffService.updateCartItem(authHeader, itemId, updateDto);
  }

  @Delete('cart/items/:itemId')
  async removeCartItem(
    @Headers('Authorization') authHeader: string,
    @Param('itemId') itemId: string,
  ) {
    return this.bffService.removeCartItem(authHeader, itemId);
  }

  // --- Profile Management Endpoints ---

  @Get('account/profile')
  async getProfile(@Headers('Authorization') authHeader: string) {
    return this.bffService.getProfile(authHeader);
  }

  @Put('account/profile')
  async updateProfile(
    @Headers('Authorization') authHeader: string,
    @Body() updateProfileDto: any,
  ) {
    return this.bffService.updateProfile(authHeader, updateProfileDto);
  }

  @Get('account/addresses')
  async getAddresses(@Headers('Authorization') authHeader: string) {
    return this.bffService.getAddresses(authHeader);
  }

  @Post('account/addresses')
  async addAddress(
    @Headers('Authorization') authHeader: string,
    @Body() addAddressDto: any,
  ) {
    return this.bffService.addAddress(authHeader, addAddressDto);
  }

  @Put('account/addresses/:addressId')
  async updateAddress(
    @Headers('Authorization') authHeader: string,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: any,
  ) {
    return this.bffService.updateAddress(authHeader, addressId, updateAddressDto);
  }

  @Delete('account/addresses/:addressId')
  async removeAddress(
    @Headers('Authorization') authHeader: string,
    @Param('addressId') addressId: string,
  ) {
    return this.bffService.removeAddress(authHeader, addressId);
  }

  @Get('account/my-reviews')
  async getMyReviews(@Headers('Authorization') authHeader: string) {
    return this.bffService.getMyReviews(authHeader);
  }

  @Put('account/addresses/:addressId/default')
  async setDefaultAddress(
    @Headers('Authorization') authHeader: string,
    @Param('addressId') addressId: string,
  ) {
    return this.bffService.setDefaultAddress(authHeader, addressId);
  }

  @Get('checkout-data')
  async getCheckoutData(@Headers('Authorization') authHeader: string) {
    return this.bffService.getCheckoutData(authHeader);
  }

  // --- Wishlist Endpoints ---

  @Get('wishlist')
  async getWishlist(@Headers('Authorization') authHeader: string) {
    return this.bffService.getWishlist(authHeader);
  }

  @Post('wishlist')
  async addToWishlist(
    @Headers('Authorization') authHeader: string,
    @Body() { productId }: { productId: string },
  ) {
    return this.bffService.addToWishlist(authHeader, { productId });
  }

  @Delete('wishlist/:itemId')
  async removeFromWishlist(
    @Headers('Authorization') authHeader: string,
    @Param('itemId') itemId: string,
  ) {
    return this.bffService.removeFromWishlist(authHeader, itemId);
  }

  @Get('orders')
  async getOrders(@Headers('Authorization') authHeader: string) {
    return this.bffService.getOrders(authHeader);
  }
  @Get('orders/:orderId')
  async getOrderById(
    @Headers('Authorization') authHeader: string,
    @Param('orderId') orderId: string,
  ) {
    return this.bffService.getOrderById(authHeader, orderId);
  }

  @Post('orders')
  async createOrder(
    @Headers('Authorization') authHeader: string,
    @Body() createOrderDto: { shippingAddressId?: string, paymentMethod: string },
  ) {
    return this.bffService.createOrder(authHeader, createOrderDto);
  }
}
