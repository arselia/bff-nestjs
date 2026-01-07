import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors, HttpCode } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ProductsService } from './products.service'; // Added
import { JwtAuthGuard, Roles } from './auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { ProductResponseDto } from './dto/response-product.dto'; // Added
import { MongooseClassSerializerInterceptor } from './mongoose-class-serializer.interceptor';
import { Category } from './schema/category.schema';
import { Product } from './schema/product.schema'; // Added

@UseInterceptors(MongooseClassSerializerInterceptor(CategoryResponseDto))
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly productsService: ProductsService, // Added
  ) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Get(':categoryId/products')
  @UseInterceptors(MongooseClassSerializerInterceptor(ProductResponseDto))
  findProductsByCategory(@Param('categoryId') categoryId: string): Promise<Product[]> {
    return this.productsService.findAllByCategory(categoryId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Roles('Admin')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.categoryService.remove(id);
    return { message: 'Kategori berhasil dihapus' };
  }
}
