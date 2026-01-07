import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schema/category.schema';
import { Product, ProductDocument } from './schema/product.schema'; // Added
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>, // Added
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({ name: createCategoryDto.name });
    if (existingCategory) {
      throw new BadRequestException(`Category with name '${createCategoryDto.name}' already exists.`);
    }
    return this.categoryModel.create(createCategoryDto);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({ 
        name: updateCategoryDto.name,
        _id: { $ne: id } 
      });
      if (existingCategory) {
        throw new BadRequestException(`Category with name '${updateCategoryDto.name}' already exists.`);
      }
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { new: true }).exec();
    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const productsInCategory = await this.productModel.countDocuments({ categoryId: id }).exec();
    if (productsInCategory > 0) {
      throw new BadRequestException('Kategori tidak dapat dihapus karena masih digunakan oleh produk lain.');
    }

    const deletedCategory = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
