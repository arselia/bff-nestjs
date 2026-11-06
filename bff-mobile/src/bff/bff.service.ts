import { BadRequestException, ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
@Injectable()
export class BffService implements OnModuleInit {
  // Tambahkan tanda seru (!) di sini
  private services!: Record<string, string>;
  private internalSecret!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const userServiceUrl = this.configService.get('USER_SERVICE_URL')!;
    const productServiceUrl = this.configService.get('PRODUCT_SERVICE_URL')!;
    const orderServiceUrl = this.configService.get('ORDER_SERVICE_URL')!;
    const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL')!;
    this.internalSecret = this.configService.get('INTERNAL_SECRET_KEY')!;

    if (!userServiceUrl || !productServiceUrl || !orderServiceUrl || !paymentServiceUrl || !this.internalSecret) {
      throw new Error('One or more service URLs or the internal secret are not defined in the environment variables.');
    }

    this.services = {
      user: userServiceUrl,
      product: productServiceUrl,
      order: orderServiceUrl,
      wishlist: orderServiceUrl,
      payment: paymentServiceUrl,
    };
  }

  private _getAxiosConfig(authHeader?: string): AxiosRequestConfig {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Internal-Secret': this.internalSecret,
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    return { headers };
  }

  async getUserDashboard(authHeader: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);

      const results = await Promise.allSettled([
        axios.get(`${this.services.user}/users/profile`, axiosConfig),
        axios.get(`${this.services.order}/orders/my-orders`, axiosConfig),
        axios.get(`${this.services.wishlist}/wishlists`, axiosConfig),
      ]);

      const user = results[0].status === 'fulfilled' ? (results[0] as any).value.data : null;
      const orders = results[1].status === 'fulfilled' ? (results[1] as any).value.data : [];
      const wishlist = results[2].status === 'fulfilled' ? (results[2] as any).value.data : [];

      const mobileUser = user ? { id: user.id, username: user.username } : null;
      const mobileOrders = orders?.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items?.length || 0,
      })) || [];
      const wishlistCount = wishlist?.length || 0;

      return { user: mobileUser, orders: mobileOrders, wishlistCount };
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Dashboard:', error.response?.data || error.message);
      return { user: null, orders: [], wishlistCount: 0 };
    }
  }

  async getProductById(id: string) {
    const axiosConfig = this._getAxiosConfig();

    const results = await Promise.allSettled([
      axios.get(`${this.services.product}/products/${id}`, axiosConfig),
      axios.get(`${this.services.product}/products/${id}/reviews`, axiosConfig),
    ]);

    const product = results[0].status === 'fulfilled' ? (results[0] as any).value.data : null;
    const reviews = results[1].status === 'fulfilled' ? (results[1] as any).value.data : [];

    if (!product) {
      throw new BadRequestException('Produk tidak ditemukan atau layanan sedang tidak tersedia.');
    }

    const topReviews = reviews?.slice(0, 3) || [];

    return { ...product, reviews: topReviews };
  }

  async getCart(authHeader: string) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      
      const cart = await axios.get(`${this.services.order}/carts`, axiosConfigWithAuth).then(r => r.data);

      if (!cart || cart.length === 0) return [];

      const productDetailsPromises = cart.map((item: any) =>
        axios.get(`${this.services.product}/products/${item.productId}`, axiosConfigWithoutAuth)
          .then(r => r.data)
          .catch(() => null)
      );
      const products = await Promise.all(productDetailsPromises);

      return cart.map((item: any, index: number) => {
        const product = products[index];
        return {
          ...item,
          productName: product ? product.name : 'Produk tidak tersedia',
          productImageUrl: product ? product.imageUrl : null,
          productPrice: product ? product.price : 0,
          isAvailable: !!product,
        };
      });
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Cart:', error.response?.data || error.message);
      throw new BadRequestException('Gagal mengambil data keranjang.');
    }
  }

  async addToCart(authHeader: string, addToCartDto: { productId: string, quantity: number }) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();

      const product = await axios.get(`${this.services.product}/products/${addToCartDto.productId}`, axiosConfigWithoutAuth).then(r => r.data);

      if (!product) throw new BadRequestException('Produk tidak ditemukan.');
      if (product.stock < addToCartDto.quantity) throw new BadRequestException(`Stok produk ${product.name} tidak cukup. Tersedia: ${product.stock}`);

      return await axios.post(`${this.services.order}/carts`, addToCartDto, axiosConfigWithAuth).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Add To Cart:', error.response?.data || error.message);
      if (error.response?.status === 400) throw new BadRequestException(error.response.data.message || 'Permintaan tidak valid.');
      throw new BadRequestException('Gagal menambahkan produk ke keranjang.');
    }
  }

  async updateCartItem(authHeader: string, itemId: string, updateDto: { quantity: number }) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();

      const cartItem = await axios.get(`${this.services.order}/carts/${itemId}`, axiosConfigWithAuth).then(r => r.data);
      if (!cartItem) throw new BadRequestException('Item keranjang tidak ditemukan.');

      const product = await axios.get(`${this.services.product}/products/${cartItem.productId}`, axiosConfigWithoutAuth).then(r => r.data);
      if (!product) throw new BadRequestException('Produk untuk item ini tidak lagi tersedia.');
      if (product.stock < updateDto.quantity) throw new BadRequestException(`Stok produk ${product.name} tidak cukup. Tersedia: ${product.stock}`);

      return await axios.put(`${this.services.order}/carts/${itemId}`, updateDto, axiosConfigWithAuth).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Update Cart:', error.response?.data || error.message);
      if (error.response?.status === 400) throw new BadRequestException(error.response.data.message || 'Permintaan tidak valid.');
      throw new BadRequestException('Gagal memperbarui item di keranjang.');
    }
  }

  async removeCartItem(authHeader: string, itemId: string) {
    try {
      await axios.delete(`${this.services.order}/carts/${itemId}`, this._getAxiosConfig(authHeader));
      return { message: 'Item keranjang berhasil dihapus.' };
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Remove Cart:', error.response?.data || error.message);
      if (error.response?.status === 404) throw new BadRequestException('Item keranjang tidak ditemukan.');
      throw new BadRequestException('Gagal menghapus item dari keranjang.');
    }
  }

  async getProfile(authHeader: string) {
    try {
      return await axios.get(`${this.services.user}/users/profile`, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Profile:', error.response?.data || error.message);
      if (error.response?.status === 401) throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      throw new BadRequestException('Gagal mengambil data profil.');
    }
  }

  async updateProfile(authHeader: string, updateProfileDto: any) {
    try {
      return await axios.put(`${this.services.user}/users/profile/update`, updateProfileDto, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Update Profile:', error.response?.data || error.message);
      if (error.response?.status === 400) throw new BadRequestException(error.response.data.message || 'Data profil tidak valid.');
      if (error.response?.status === 401) throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      throw new BadRequestException('Gagal memperbarui profil.');
    }
  }

  async getAddresses(authHeader: string) {
    try {
      return await axios.get(`${this.services.user}/users/profile/addresses`, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Addresses:', error.response?.data || error.message);
      if (error.response?.status === 401) throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      return []; 
    }
  }

  async addAddress(authHeader: string, addAddressDto: any) {
    try {
      return await axios.post(`${this.services.user}/users/profile/addresses`, addAddressDto, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Add Address:', error.response?.data || error.message);
      if (error.response?.status === 400) throw new BadRequestException(error.response.data.message || 'Data alamat tidak valid.');
      if (error.response?.status === 401) throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      throw new BadRequestException('Gagal menambahkan alamat baru.');
    }
  }

  async updateAddress(authHeader: string, addressId: string, updateAddressDto: any) {
    try {
      return await axios.put(`${this.services.user}/users/profile/addresses/${addressId}`, updateAddressDto, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Update Address:', error.response?.data || error.message);
      if (error.response?.status === 400 || error.response?.status === 404) throw new BadRequestException(error.response.data.message || 'Data alamat tidak valid atau alamat tidak ditemukan.');
      if (error.response?.status === 401) throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      throw new BadRequestException('Gagal memperbarui alamat.');
    }
  }

  async removeAddress(authHeader: string, addressId: string) {
    try {
      await axios.delete(`${this.services.user}/users/profile/addresses/${addressId}`, this._getAxiosConfig(authHeader));
      return { message: 'Alamat berhasil dihapus.' };
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Remove Address:', error.response?.data || error.message);
      if (error.response?.status === 400 || error.response?.status === 404) throw new BadRequestException(error.response.data.message || 'Alamat tidak ditemukan atau tidak dapat dihapus.');
      if (error.response?.status === 401) throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      throw new BadRequestException('Gagal menghapus alamat.');
    }
  }

  async createReview(authHeader: string, productId: string, createReviewDto: { rating: number; comment: string }) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);

      const purchaseValidationResponse = await axios.get(
        `${this.services.order}/orders/check-product-purchase?productId=${productId}`,
        axiosConfig,
      );

      if (!purchaseValidationResponse.data.hasPurchased) {
        throw new ForbiddenException('Anda hanya dapat memberikan ulasan untuk produk yang telah Anda beli.');
      }

      return await axios.post(`${this.services.product}/products/${productId}/reviews`, createReviewDto, axiosConfig).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Create Review:', error.response?.data || error.message);
      if (error.response?.status === 403) throw new ForbiddenException(error.response?.data?.message || 'Anda tidak diizinkan untuk melakukan aksi ini.');
      throw new BadRequestException(error.response?.data?.message || 'Gagal membuat ulasan.');
    }
  }

  async getMyReviews(authHeader: string) {
    try {
      return await axios.get(`${this.services.product}/products/reviews/me`, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Get Reviews:', error.response?.data || error.message);
      return []; 
    }
  }

  async setDefaultAddress(authHeader: string, addressId: string) {
    try {
      return await axios.put(`${this.services.user}/users/profile/addresses/${addressId}/default`, {}, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Default Address:', error.response?.data || error.message);
      if (error.response?.status === 400 || error.response?.status === 404) throw new BadRequestException(error.response.data.message || 'Alamat tidak ditemukan atau tidak dapat diatur sebagai default.');
      if (error.response?.status === 401) throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      throw new BadRequestException('Gagal mengatur alamat default.');
    }
  }

  async getCheckoutData(authHeader: string) {
    const results = await Promise.allSettled([
      this.getCart(authHeader),
      this.getAddresses(authHeader)
    ]);

    const cart = results[0].status === 'fulfilled' ? (results[0] as any).value : [];
    const addresses = results[1].status === 'fulfilled' ? (results[1] as any).value : [];

    const defaultAddress = addresses?.find((addr: any) => addr.isDefault) || null;

    return { cart, defaultAddress };
  }

  async getWishlist(authHeader: string) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      const wishlist = await axios.get(`${this.services.wishlist}/wishlists`, axiosConfigWithAuth).then(r => r.data);

      if (!wishlist || wishlist.length === 0) return [];

      const enrichedItemsResults = await Promise.allSettled(
        wishlist.map((item: any) =>
          axios.get(`${this.services.product}/products/${item.productId}`, axiosConfigWithoutAuth)
        )
      );

      return wishlist.map((item: any, index: number) => {
        const res = enrichedItemsResults[index];
        return {
          ...item,
          product: res.status === 'fulfilled' ? (res as any).value.data : { name: 'Produk tidak lagi tersedia' }
        };
      });
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Wishlist:', error.response?.data || error.message);
      return []; 
    }
  }

  async addToWishlist(authHeader: string, { productId }: { productId: string }) {
    try {
      return await axios.post(`${this.services.wishlist}/wishlists`, { productId }, this._getAxiosConfig(authHeader)).then(r => r.data);
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Add Wishlist:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal menambahkan item ke wishlist.');
    }
  }

  async removeFromWishlist(authHeader: string, itemId: string) {
    try {
      await axios.delete(`${this.services.wishlist}/wishlists/${itemId}`, this._getAxiosConfig(authHeader));
      return { message: 'Item berhasil dihapus dari wishlist.' };
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Remove Wishlist:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal menghapus item dari wishlist.');
    }
  }

  async getOrders(authHeader: string) {
    try {
      const orders = await axios.get(`${this.services.order}/orders/my-orders`, this._getAxiosConfig(authHeader)).then(r => r.data);

      return orders?.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
      })) || [];
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Get Orders:', error.response?.data || error.message);
      return []; 
    }
  }

  async getOrderById(authHeader: string, orderId: string) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      const order = await axios.get(`${this.services.order}/orders/${orderId}`, axiosConfigWithAuth).then(r => r.data);

      if (!order || !order.items) return order;

      const enrichedItemsResults = await Promise.allSettled(
        order.items.map((item: any) =>
          axios.get(`${this.services.product}/products/${item.productId}`, axiosConfigWithoutAuth)
        )
      );

      const enrichedItems = enrichedItemsResults.map((res, index) => {
        const item = order.items[index];
        return {
          ...item,
          product: res.status === 'fulfilled' ? (res as any).value.data : { name: 'Produk tidak tersedia' },
        };
      });

      return { ...order, items: enrichedItems };
    } catch (e) {
      const error = e as any;
      console.error('BFF Error Order Details:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal mengambil detail pesanan.');
    }
  }

  async createOrder(
    authHeader: string,
    createOrderDto: { shippingAddressId?: string; paymentMethod: string }
  ) {
    const axiosConfig = this._getAxiosConfig(authHeader);

    let orderResponse;
    let paymentResponse = null;

    try {
      orderResponse = await axios.post(`${this.services.order}/orders`, { 
        shippingAddressId: createOrderDto.shippingAddressId 
      }, axiosConfig).then((r) => r.data);
    } catch (e) {
      const error = e as any;
      console.error('Order Error:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal membuat pesanan.');
    }

    try {
      paymentResponse = await axios.post(`${this.services.payment}/payments`, {
        orderId: orderResponse.id,
        method: createOrderDto.paymentMethod,
      }, axiosConfig).then((r) => r.data);
    } catch (e) {
      const error = e as any;
      console.error('Payment Error:', error.response?.data || error.message);
    }

    return {
      order: orderResponse,
      payment: paymentResponse, 
      paymentStatus: paymentResponse ? 'success' : 'failed',
    };
  }
}