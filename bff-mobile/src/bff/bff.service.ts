import { BadRequestException, ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class BffService implements OnModuleInit {
  private services: Record<string, string>;
  private internalSecret: string;

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
      wishlist: orderServiceUrl, // Wishlist is part of order service
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

      const [user, orders, wishlist] = await Promise.all([
        axios.get(`${this.services.user}/users/profile`, axiosConfig).then(r => r.data),
        axios.get(`${this.services.order}/orders/my-orders`, axiosConfig).then(r => r.data),
        axios.get(`${this.services.wishlist}/wishlists`, axiosConfig).then(r => r.data).catch(() => []), // fallback
      ]);

      // --- Mobile-specific Data Transformation ---

      // 1. Simplify user data (remove addresses, fullname, email)
      const mobileUser = {
        id: user.id,
        username: user.username,
      };

      // 2. Simplify order data
      const mobileOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        itemCount: order.items.length,
      }));

      // 3. Simplify wishlist data to a count
      const wishlistCount = wishlist.length;

      return {
        user: mobileUser,
        orders: mobileOrders,
        wishlistCount,
      };
    } catch (error) {
      // We can log the internal error for debugging
      console.error('BFF Error:', error.response?.data || error.message);
      throw new Error('❌ Failed to fetch dashboard data');
    }
  }

  async getProductById(id: string) {
    try {
      const axiosConfig = this._getAxiosConfig();
      const [product, reviews] = await Promise.all([
        axios.get(`${this.services.product}/products/${id}`, axiosConfig).then(r => r.data),
        axios.get(`${this.services.product}/products/${id}/reviews`, axiosConfig).then(r => r.data).catch(() => []), // fallback
      ]);

      // --- Mobile-specific Data Transformation ---
      // Only show top 3 reviews
      const topReviews = reviews.slice(0, 3);

      return {
        ...product,
        reviews: topReviews,
      };
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      throw new Error('❌ Failed to fetch product data');
    }
  }

  async getCart(authHeader: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const cart = await axios.get(`${this.services.order}/carts`, axiosConfig).then(r => r.data);
      return cart;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      throw new Error('❌ Failed to fetch cart data');
    }
  }

  async addToCart(authHeader: string, addToCartDto: { productId: string, quantity: number }) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();

      // Step 1: Validate product and stock from product-service
      const product = await axios.get(`${this.services.product}/products/${addToCartDto.productId}`, axiosConfigWithoutAuth).then(r => r.data);

      if (!product) {
        throw new BadRequestException('Produk tidak ditemukan.');
      }
      if (product.stock < addToCartDto.quantity) {
        throw new BadRequestException(`Stok produk ${product.name} tidak cukup. Tersedia: ${product.stock}`);
      }

      // Step 2: Add item to cart via order-service
      const cartItem = await axios.post(`${this.services.order}/carts`, addToCartDto, axiosConfigWithAuth).then(r => r.data);
      return cartItem;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      // Re-throw specific exceptions or a generic one
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Permintaan tidak valid.');
      }
      throw new BadRequestException('Gagal menambahkan produk ke keranjang.');
    }
  }

  async updateCartItem(authHeader: string, itemId: string, updateDto: { quantity: number }) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      
      // Step 1: Get cart item from order-service to find the productId
      const cartItem = await axios.get(`${this.services.order}/carts/${itemId}`, axiosConfigWithAuth).then(r => r.data);
      if (!cartItem) {
        throw new BadRequestException('Item keranjang tidak ditemukan.');
      }

      // Step 2: Validate product and stock from product-service
      const product = await axios.get(`${this.services.product}/products/${cartItem.productId}`, axiosConfigWithoutAuth).then(r => r.data);
      if (!product) {
        throw new BadRequestException('Produk untuk item ini tidak lagi tersedia.');
      }
      if (product.stock < updateDto.quantity) {
        throw new BadRequestException(`Stok produk ${product.name} tidak cukup. Tersedia: ${product.stock}`);
      }

      // Step 3: Update item quantity in cart via order-service
      const updatedCartItem = await axios.put(`${this.services.order}/carts/${itemId}`, updateDto, axiosConfigWithAuth).then(r => r.data);
      return updatedCartItem;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Permintaan tidak valid.');
      }
      throw new BadRequestException('Gagal memperbarui item di keranjang.');
    }
  }

  async removeCartItem(authHeader: string, itemId: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      await axios.delete(`${this.services.order}/carts/${itemId}`, axiosConfig);
      return { message: 'Item keranjang berhasil dihapus.' };
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        throw new BadRequestException('Item keranjang tidak ditemukan.');
      }
      throw new BadRequestException('Gagal menghapus item dari keranjang.');
    }
  }

  async getProfile(authHeader: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const profile = await axios.get(`${this.services.user}/users/profile`, axiosConfig).then(r => r.data);
      return profile;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      }
      throw new BadRequestException('Gagal mengambil data profil.');
    }
  }

  async updateProfile(authHeader: string, updateProfileDto: any) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const response = await axios.put(`${this.services.user}/users/profile/update`, updateProfileDto, axiosConfig).then(r => r.data);
      return response;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Data profil tidak valid.');
      }
      if (error.response?.status === 401) {
        throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      }
      throw new BadRequestException('Gagal memperbarui profil.');
    }
  }

  async getAddresses(authHeader: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const addresses = await axios.get(`${this.services.user}/users/profile/addresses`, axiosConfig).then(r => r.data);
      return addresses;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      }
      throw new BadRequestException('Gagal mengambil daftar alamat.');
    }
  }

  async addAddress(authHeader: string, addAddressDto: any) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const newAddress = await axios.post(`${this.services.user}/users/profile/addresses`, addAddressDto, axiosConfig).then(r => r.data);
      return newAddress;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Data alamat tidak valid.');
      }
      if (error.response?.status === 401) {
        throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      }
      throw new BadRequestException('Gagal menambahkan alamat baru.');
    }
  }

  async updateAddress(authHeader: string, addressId: string, updateAddressDto: any) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const updatedAddress = await axios.put(`${this.services.user}/users/profile/addresses/${addressId}`, updateAddressDto, axiosConfig).then(r => r.data);
      return updatedAddress;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 400 || error.response?.status === 404) {
        throw new BadRequestException(error.response.data.message || 'Data alamat tidak valid atau alamat tidak ditemukan.');
      }
      if (error.response?.status === 401) {
        throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      }
      throw new BadRequestException('Gagal memperbarui alamat.');
    }
  }

  async removeAddress(authHeader: string, addressId: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      await axios.delete(`${this.services.user}/users/profile/addresses/${addressId}`, axiosConfig);
      return { message: 'Alamat berhasil dihapus.' };
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 400 || error.response?.status === 404) {
        throw new BadRequestException(error.response.data.message || 'Alamat tidak ditemukan atau tidak dapat dihapus.');
      }
      if (error.response?.status === 401) {
        throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      }
      throw new BadRequestException('Gagal menghapus alamat.');
    }
  }

  // --- Product Review Service Methods ---

  async createReview(authHeader: string, productId: string, createReviewDto: { rating: number; comment: string }) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);

      // Step 1: Validate that the user has purchased the product
      const purchaseCheckResponse = await axios.get(
        `${this.services.order}/orders/check-product-purchase?productId=${productId}`,
        axiosConfig,
      );

      if (!purchaseCheckResponse.data.hasPurchased) {
        throw new ForbiddenException('Anda hanya dapat mengulas produk yang telah Anda beli.');
      }

      // Step 2: If purchased, proceed to create the review
      const reviewResponse = await axios.post(`${this.services.product}/products/${productId}/reviews`, createReviewDto, axiosConfig);
      return reviewResponse.data;
    } catch (error) {
      console.error('BFF Error creating review:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        throw new ForbiddenException(error.response.data.message);
      }
      throw new BadRequestException(error.response?.data?.message || 'Gagal membuat ulasan.');
    }
  }

  async getMyReviews(authHeader: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const response = await axios.get(`${this.services.product}/products/reviews/me`, axiosConfig);
      return response.data;
    } catch (error) {
      console.error('BFF Error getting my reviews:', error.response?.data || error.message);
      throw new BadRequestException('Gagal mengambil daftar ulasan.');
    }
  }

  async setDefaultAddress(authHeader: string, addressId: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const updatedAddress = await axios.put(`${this.services.user}/users/profile/addresses/${addressId}/default`, {}, axiosConfig).then(r => r.data);
      return updatedAddress;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 400 || error.response?.status === 404) {
        throw new BadRequestException(error.response.data.message || 'Alamat tidak ditemukan atau tidak dapat diatur sebagai default.');
      }
      if (error.response?.status === 401) {
        throw new BadRequestException('Sesi tidak valid atau telah berakhir.');
      }
      throw new BadRequestException('Gagal mengatur alamat default.');
    }
  }

  async getCheckoutData(authHeader: string) {
    let cart, addresses;

    try {
      cart = await this.getCart(authHeader);
    } catch (error) {
      console.error(
        'BFF Error fetching cart for checkout:',
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        'Gagal mengambil data keranjang untuk checkout.',
      );
    }

    try {
      addresses = await this.getAddresses(authHeader);
    } catch (error) {
      console.error(
        'BFF Error fetching addresses for checkout:',
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        'Gagal mengambil data alamat untuk checkout.',
      );
    }

    // --- Mobile-specific Data Transformation ---
    const defaultAddress = addresses.find(addr => addr.isDefault);

    return {
      cart,
      defaultAddress: defaultAddress || null, // Return only the default address
    };
  }

  // --- Wishlist Service Methods ---

  async getWishlist(authHeader: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const response = await axios.get(`${this.services.wishlist}/wishlists`, axiosConfig);
      return response.data;
    } catch (error) {
      console.error('BFF Error getting wishlist:', error.response?.data || error.message);
      throw new BadRequestException('Gagal mengambil data wishlist.');
    }
  }

  async addToWishlist(authHeader: string, { productId }: { productId: string }) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const response = await axios.post(`${this.services.wishlist}/wishlists`, { productId }, axiosConfig);
      return response.data;
    } catch (error) {
      console.error('BFF Error adding to wishlist:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal menambahkan item ke wishlist.');
    }
  }

  async removeFromWishlist(authHeader: string, itemId: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      await axios.delete(`${this.services.wishlist}/wishlists/${itemId}`, axiosConfig);
      return { message: 'Item berhasil dihapus dari wishlist.' };
    } catch (error) {
      console.error('BFF Error removing from wishlist:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal menghapus item dari wishlist.');
    }
  }

  // --- Order History Service Methods ---

  async getOrders(authHeader: string) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);
      const orders = await axios.get(`${this.services.order}/orders/my-orders`, axiosConfig).then(r => r.data);

      // --- Mobile-specific Data Transformation ---
      const mobileOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
      }));

      return mobileOrders;
    } catch (error) {
      console.error('BFF Error getting orders:', error.response?.data || error.message);
      throw new BadRequestException('Gagal mengambil daftar pesanan.');
    }
  }

  async getOrderById(authHeader: string, orderId: string) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      
      // 1. Get the base order from order-service
      const order = await axios.get(`${this.services.order}/orders/${orderId}`, axiosConfigWithAuth).then(r => r.data);

      if (!order || !order.items) {
        return order; // Return as is if there's no order or no items
      }

      // 2. Fetch full product details for each item in the order
      const enrichedItemsPromises = order.items.map(item => {
        return axios.get(`${this.services.product}/products/${item.productId}`, axiosConfigWithoutAuth)
          .then(response => ({
            ...item, // Keep the original item data (quantity, price snapshot)
            product: response.data, // Add the full product details
          }))
          .catch(() => ({
            ...item, // If product not found, return the item with a note
            product: { name: 'Produk tidak lagi tersedia' },
          }));
      });

      const enrichedItems = await Promise.all(enrichedItemsPromises);

      // 3. Return the order with enriched items
      return {
        ...order,
        items: enrichedItems,
      };
    } catch (error) {
      console.error('BFF Error getting order by ID:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal mengambil detail pesanan.');
    }
  }

  async createOrder(authHeader: string, createOrderDto: { shippingAddressId?: string, paymentMethod: string }) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);

      // Step 1: Create order in order-service
      const orderResponse = await axios.post(`${this.services.order}/orders`, {
        shippingAddressId: createOrderDto.shippingAddressId,
      }, axiosConfig).then(r => r.data);

      const orderId = orderResponse.id; // orderId diambil dari JSON respons order-service

      // Step 2: Create payment in payment-service using the obtained orderId
      const paymentResponse = await axios.post(`${this.services.payment}/payments`, {
        orderId: orderId,
        method: createOrderDto.paymentMethod,
      }, axiosConfig).then(r => r.data);

      return {
        order: orderResponse,
        payment: paymentResponse,
      };
    } catch (error) {
      console.error('BFF Error creating order:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Permintaan tidak valid.');
      }
      throw new BadRequestException('Gagal membuat pesanan.');
    }
  }
}
