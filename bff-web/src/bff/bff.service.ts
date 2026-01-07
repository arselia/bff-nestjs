import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class BffService {
  private userServiceUrl: string;
  private productServiceUrl: string;
  private orderServiceUrl: string;
  private paymentServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize service URLs from environment variables
    this.userServiceUrl = this.configService.get('USER_SERVICE_URL')!;
    this.productServiceUrl = this.configService.get('PRODUCT_SERVICE_URL')!;
    this.orderServiceUrl = this.configService.get('ORDER_SERVICE_URL')!;
    this.paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL')!;
  }

  /**
   * Creates a standard axios configuration object, including the internal secret
   * and the user's authorization token if provided.
   * @param authHeader The 'Authorization' header from the incoming request.
   * @returns A complete AxiosRequestConfig object.
   */
  private _getAxiosConfig(authHeader?: string): AxiosRequestConfig {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Internal-Secret': this.configService.get('INTERNAL_SECRET_KEY')!,
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
        axios.get(`${this.userServiceUrl}/users/profile`, axiosConfig).then(r => r.data),
        axios.get(`${this.orderServiceUrl}/orders/my-orders`, axiosConfig).then(r => r.data),
        axios.get(`${this.orderServiceUrl}/wishlists`, axiosConfig).then(r => r.data).catch(() => []), // fallback
      ]);

      return {
        user,
        orders,
        wishlist,
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
        axios.get(`${this.productServiceUrl}/products/${id}`, axiosConfig).then(r => r.data),
        axios.get(`${this.productServiceUrl}/products/${id}/all-reviews`, axiosConfig).then(r => r.data).catch(() => []), // fallback
      ]);

      // For web, we return all reviews without transformation
      return {
        ...product,
        reviews,
      };
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      throw new Error('❌ Failed to fetch product data');
    }
  }

  async getCart(authHeader: string) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      
      const cart = await axios.get(`${this.orderServiceUrl}/carts`, axiosConfigWithAuth).then(r => r.data);

      if (!cart || cart.length === 0) {
        return [];
      }

      const productDetailsPromises = cart.map(item =>
        axios.get(`${this.productServiceUrl}/products/${item.productId}`, axiosConfigWithoutAuth)
          .then(r => r.data)
          .catch(() => null)
      );
      const products = await Promise.all(productDetailsPromises);

      const enrichedCart = cart.map((item, index) => {
        const product = products[index];
        return {
          ...item,
          productName: product ? product.name : 'Produk tidak tersedia',
          productImageUrl: product ? product.imageUrl : null,
          productPrice: product ? product.price : 0,
          isAvailable: !!product,
        };
      });

      return enrichedCart;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      throw new Error('❌ Failed to fetch cart data');
    }
  }

  async addToCart(authHeader: string, addToCartDto: { productId: string, quantity: number }) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();

      const product = await axios.get(`${this.productServiceUrl}/products/${addToCartDto.productId}`, axiosConfigWithoutAuth).then(r => r.data);

      if (!product) {
        throw new BadRequestException('Produk tidak ditemukan.');
      }
      if (product.stock < addToCartDto.quantity) {
        throw new BadRequestException(`Stok produk ${product.name} tidak cukup. Tersedia: ${product.stock}`);
      }

      const cartItem = await axios.post(`${this.orderServiceUrl}/carts`, addToCartDto, axiosConfigWithAuth).then(r => r.data);
      return cartItem;
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        throw new BadRequestException(error.response.data.message || 'Permintaan tidak valid.');
      }
      throw new BadRequestException('Gagal menambahkan produk ke keranjang.');
    }
  }

  async updateCartItem(authHeader: string, itemId: string, updateDto: { quantity: number }) {
    try {
      const axiosConfig = this._getAxiosConfig(authHeader);

      const cartItem = await axios.get(`${this.orderServiceUrl}/carts/${itemId}`, axiosConfig).then(r => r.data);
      if (!cartItem) {
        throw new BadRequestException('Item keranjang tidak ditemukan.');
      }

      const product = await axios.get(`${this.productServiceUrl}/products/${cartItem.productId}`, this._getAxiosConfig()).then(r => r.data);
      if (!product) {
        throw new BadRequestException('Produk untuk item ini tidak lagi tersedia.');
      }
      if (product.stock < updateDto.quantity) {
        throw new BadRequestException(`Stok produk ${product.name} tidak cukup. Tersedia: ${product.stock}`);
      }

      const updatedCartItem = await axios.put(`${this.orderServiceUrl}/carts/${itemId}`, updateDto, axiosConfig).then(r => r.data);
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
      await axios.delete(`${this.orderServiceUrl}/carts/${itemId}`, this._getAxiosConfig(authHeader));
      return { message: 'Item keranjang berhasil dihapus.' };
    } catch (error) {
      console.error('BFF Error:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        throw new BadRequestException('Item keranjang tidak ditemukan.');
      }
      throw new BadRequestException('Gagal menghapus item dari keranjang.');
    }
  }

  // --- Profile Management Methods ---

  async getProfile(authHeader: string) {
    try {
      const profile = await axios.get(`${this.userServiceUrl}/users/profile`, this._getAxiosConfig(authHeader)).then(r => r.data);
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
      const response = await axios.put(`${this.userServiceUrl}/users/profile/update`, updateProfileDto, this._getAxiosConfig(authHeader)).then(r => r.data);
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
      const addresses = await axios.get(`${this.userServiceUrl}/users/profile/addresses`, this._getAxiosConfig(authHeader)).then(r => r.data);
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
      const newAddress = await axios.post(`${this.userServiceUrl}/users/profile/addresses`, addAddressDto, this._getAxiosConfig(authHeader)).then(r => r.data);
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
      const updatedAddress = await axios.put(`${this.userServiceUrl}/users/profile/addresses/${addressId}`, updateAddressDto, this._getAxiosConfig(authHeader)).then(r => r.data);
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
      await axios.delete(`${this.userServiceUrl}/users/profile/addresses/${addressId}`, this._getAxiosConfig(authHeader));
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

      const purchaseValidationResponse = await axios.get(
        `${this.orderServiceUrl}/orders/check-product-purchase?productId=${productId}`,
        axiosConfig,
      );

      if (!purchaseValidationResponse.data.hasPurchased) {
        throw new ForbiddenException('Anda hanya dapat memberikan ulasan untuk produk yang telah Anda beli.');
      }

      const response = await axios.post(`${this.productServiceUrl}/products/${productId}/reviews`, createReviewDto, axiosConfig);
      return response.data;
    } catch (error) {
      console.error('BFF Error creating review:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        throw new ForbiddenException(error.response?.data?.message || 'Anda tidak diizinkan untuk melakukan aksi ini.');
      }
      throw new BadRequestException(error.response?.data?.message || 'Gagal membuat ulasan.');
    }
  }

  async getMyReviews(authHeader: string) {
    try {
      const response = await axios.get(`${this.productServiceUrl}/products/reviews/me`, this._getAxiosConfig(authHeader));
      return response.data;
    } catch (error) {
      console.error('BFF Error getting my reviews:', error.response?.data || error.message);
      throw new BadRequestException('Gagal mengambil daftar ulasan.');
    }
  }

  async setDefaultAddress(authHeader: string, addressId: string) {
    try {
      const updatedAddress = await axios.put(`${this.userServiceUrl}/users/profile/addresses/${addressId}/default`, {}, this._getAxiosConfig(authHeader)).then(r => r.data);
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

    return {
      cart,
      addresses,
    };
  }

  // --- Wishlist Service Methods ---

  async getWishlist(authHeader: string) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      const wishlist = await axios.get(`${this.orderServiceUrl}/wishlists`, axiosConfigWithAuth).then(r => r.data);

      if (!wishlist || wishlist.length === 0) {
        return [];
      }

      const enrichedItemsPromises = wishlist.map(item =>
        axios.get(`${this.productServiceUrl}/products/${item.productId}`, axiosConfigWithoutAuth)
          .then(response => ({
            ...item,
            product: response.data,
          }))
          .catch(() => ({
            ...item,
            product: { name: 'Produk tidak lagi tersedia' },
          }))
      );

      return Promise.all(enrichedItemsPromises);
    } catch (error) {
      console.error('BFF Error getting wishlist:', error.response?.data || error.message);
      throw new BadRequestException('Gagal mengambil data wishlist.');
    }
  }
  async addToWishlist(authHeader: string, { productId }: { productId: string }) {
    try {
      const response = await axios.post(`${this.orderServiceUrl}/wishlists`, { productId }, this._getAxiosConfig(authHeader));
      return response.data;
    } catch (error) {
      console.error('BFF Error adding to wishlist:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal menambahkan item ke wishlist.');
    }
  }

  async removeFromWishlist(authHeader: string, itemId: string) {
    try {
      await axios.delete(`${this.orderServiceUrl}/wishlists/${itemId}`, this._getAxiosConfig(authHeader));
      return { message: 'Item berhasil dihapus dari wishlist.' };
    } catch (error) {
      console.error('BFF Error removing from wishlist:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Gagal menghapus item dari wishlist.');
    }
  }

  async getOrders(authHeader: string) {
    try {
      const response = await axios.get(`${this.orderServiceUrl}/orders/my-orders`, this._getAxiosConfig(authHeader));
      return response.data;
    } catch (error) {
      console.error('BFF Error getting orders:', error.response?.data || error.message);
      throw new BadRequestException('Gagal mengambil daftar pesanan.');
    }
  }

  async getOrderById(authHeader: string, orderId: string) {
    try {
      const axiosConfigWithAuth = this._getAxiosConfig(authHeader);
      const axiosConfigWithoutAuth = this._getAxiosConfig();
      const order = await axios.get(`${this.orderServiceUrl}/orders/${orderId}`, axiosConfigWithAuth).then(r => r.data);

      if (!order || !order.items) {
        return order;
      }

      const enrichedItemsPromises = order.items.map(item => {
        return axios.get(`${this.productServiceUrl}/products/${item.productId}`, axiosConfigWithoutAuth)
          .then(response => ({
            ...item,
            product: response.data,
          }))
          .catch(() => ({
            ...item,
            product: { name: 'Produk tidak lagi tersedia' },
          }));
      });

      const enrichedItems = await Promise.all(enrichedItemsPromises);

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

      const orderResponse = await axios.post(`${this.orderServiceUrl}/orders`, {
        shippingAddressId: createOrderDto.shippingAddressId,
      }, axiosConfig).then(r => r.data);

      const orderId = orderResponse.id;

      const paymentResponse = await axios.post(`${this.paymentServiceUrl}/payments`, {
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
