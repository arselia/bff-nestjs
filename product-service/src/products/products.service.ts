import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoryService } from './category.service';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @Inject(forwardRef(() => CategoryService))
    private readonly categoryService: CategoryService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const category = await this.categoryService.findOne(dto.categoryId);
    if (!category) throw new BadRequestException('Kategori tidak ditemukan!');

    // Explicitly map DTO to the data model to handle imageUrl
    const productData = {
      name: dto.name,
      price: dto.price,
      stock: dto.stock,
      description: dto.description,
      categoryId: dto.categoryId,
      images: dto.imageUrl ? [dto.imageUrl] : [],
    };

    const createdProduct = new this.productModel(productData);
    const savedProduct = await createdProduct.save();
    return savedProduct.populate('categoryId');
  }

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find({ $or: [{ status: 'active' }, { status: { $exists: false } }] }).populate('categoryId').exec();
  }

  async findAllByCategory(categoryId: string): Promise<ProductDocument[]> {
    return this.productModel.find({ categoryId: categoryId, $or: [{ status: 'active' }, { status: { $exists: false } }] }).populate('categoryId').exec();
  }

  async findLowStock(): Promise<ProductDocument[]> {
    return this.productModel.find({ stock: { $lt: 10 }, $or: [{ status: 'active' }, { status: { $exists: false } }] }).sort({ stock: 1 }).populate('categoryId').exec();
  }

  async getProductById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findOne({ _id: id, $or: [{ status: 'active' }, { status: { $exists: false } }] }).populate('categoryId').exec();
    if (!product) throw new NotFoundException('Produk tidak ditemukan');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .populate('categoryId')
      .exec();

    if (!updated) throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);

    return updated;
  }

  async remove(id: string): Promise<void> {
    const archived = await this.productModel.findByIdAndUpdate(id, { status: 'archived' }).exec();
    if (!archived) throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
  }

  async updateStock(
    id: string,
    updateStockDto: UpdateStockDto,
  ): Promise<ProductDocument> {
    const { quantity, type } = updateStockDto;

    // 1. First, ensure the product exists.
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // 2. If decreasing, check for sufficient stock before the atomic update.
    if (type === 'decrease' && product.stock < quantity) {
      throw new BadRequestException('Stok tidak mencukupi');
    }

    // 3. Perform the atomic update.
    const updateValue = type === 'decrease' ? -quantity : quantity;
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      { $inc: { stock: updateValue } },
      { new: true },
    ).populate('categoryId').exec();

    if (!updatedProduct) {
      // This case should theoretically not be reached if the above checks pass,
      // but it's good practice to handle it.
      throw new NotFoundException('Gagal memperbarui stok produk');
    }

    return updatedProduct;
  }
}
