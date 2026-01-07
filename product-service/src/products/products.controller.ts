import { Body, Controller, Get, Post, Param, Put, Delete, UseGuards, HttpCode, UseInterceptors, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard, Roles } from './auth/jwt-auth.guard';
import { ProductResponseDto } from './dto/response-product.dto';
import { MongooseClassSerializerInterceptor } from './mongoose-class-serializer.interceptor';
import { Product } from './schema/product.schema';
import { ReviewService } from './review.service';
import { ReviewResponseDto } from './dto/review-response.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schema/review.schema';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly reviewService: ReviewService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Get()
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  async findLowStock(): Promise<Product[]> {
    return this.productsService.findLowStock();
  }

  @Get(':id')
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  async getProductById(@Param('id') id: string): Promise<Product> {
    return this.productsService.getProductById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.productsService.remove(id);
    return { message: 'Produk berhasil diarsipkan' };
  }

  @Put(':id/stock')
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Product> {
    return this.productsService.updateStock(id, updateStockDto);
  }

  // Endpoint baru, tanpa @UseGuards dan @Roles
  @Put(':id/internal/stock')
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  async updateStockInternal(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<Product> {
    return this.productsService.updateStock(id, updateStockDto);
  }

  // --- Review Endpoints ---

  @Get('reviews/me')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializerInterceptor(ReviewResponseDto))
  async findMyReviews(@Req() req: any): Promise<Review[]> {
    const userId = req.user.userId;
    return this.reviewService.findAllByUser(userId);
  }

  @Get(':id/reviews')
  @UseInterceptors(MongooseClassSerializerInterceptor(ReviewResponseDto))
  async findAllReviewsByProduct(@Param('id') productId: string): Promise<Review[]> {
    return this.reviewService.findAllByProduct(productId);
  }

  @Get(':productId/all-reviews') // New public endpoint for all reviews
  @UseInterceptors(MongooseClassSerializerInterceptor(ReviewResponseDto))
  async findAllReviewsPublic(@Param('productId') productId: string): Promise<Review[]> {
    return this.reviewService.findAllByProductId(productId);
  }

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MongooseClassSerializerInterceptor(ReviewResponseDto))
  async createReview(
    @Param('id') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: any,
  ): Promise<Review> {
    const userId = req.user.userId;
    return this.reviewService.create(productId, createReviewDto, userId);
  }

  @Get('reviews/all') // New public endpoint for all reviews
  @UseInterceptors(MongooseClassSerializerInterceptor(ReviewResponseDto))
  async findAllReviews(): Promise<Review[]> {
    return this.reviewService.findAllPublic();
  }

  @Get('reviews/:id')
  @UseInterceptors(MongooseClassSerializerInterceptor(ReviewResponseDto))
  async findOneReview(@Param('id') id: string): Promise<Review> {
    return this.reviewService.findOne(id);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async deleteReview(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;
    const userRole = req.user.role;
    await this.reviewService.delete(id, userId, userRole);
    return { message: 'Ulasan berhasil dihapus' };
  }
}
