import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schema/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from './products.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @Inject(forwardRef(() => ProductsService)) private productsService: ProductsService,
  ) {}

  async create(productId: string, createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    // Validate product exists
    await this.productsService.getProductById(productId);

    const existingReview = await this.reviewModel.findOne({ productId, userId });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product.');
    }
    return this.reviewModel.create({ ...createReviewDto, productId, userId });
  }

  async findAllByProduct(productId: string): Promise<Review[]> {
    return this.reviewModel.find({ productId }).exec();
  }

  async findAllByProductId(productId: string): Promise<Review[]> {
    return this.reviewModel.find({ productId }).exec();
  }

  async findAllByUser(userId: string): Promise<Review[]> {
    return this.reviewModel.find({ userId }).exec();
  }

  async findAllPublic(): Promise<Review[]> {
    return this.reviewModel.find().exec();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async delete(id: string, userId: string, userRole: string): Promise<void> {
    const review = await this.findOne(id);

    if (userRole.toLowerCase() !== 'admin' && review.userId.toString() !== userId) {
      throw new ForbiddenException('Anda tidak memiliki izin untuk menghapus ulasan ini.');
    }

    await this.reviewModel.deleteOne({ _id: id }).exec();
  }
}
