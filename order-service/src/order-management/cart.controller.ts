import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { MongooseClassSerializerInterceptor } from './mongoose-class-serializer.interceptor';
import { CartResponseDto } from './dto/cart-response.dto';
import { Cart } from './schemas/cart.schema';

@UseGuards(JwtAuthGuard)

@Controller('carts')



@UseInterceptors(MongooseClassSerializerInterceptor(CartResponseDto))

export class CartController {

  constructor(private readonly cartService: CartService) {}



  @Post()

  async create(@Request() req, @Body() createCartDto: CreateCartItemDto): Promise<Cart> {

    const userId = req.user.id;

    return this.cartService.create(userId, createCartDto);

  }



  @Get()

  async findAllByUser(@Request() req): Promise<Cart[]> {

    const userId = req.user.id;

    return this.cartService.findAllByUser(userId);

  }



  @Get(':id')

  async findOne(@Request() req, @Param('id') id: string): Promise<Cart> {

    const userId = req.user.id;

    return this.cartService.findOne(userId, id);

  }



  @Put(':id')

  async update(@Request() req, @Param('id') id: string, @Body() updateCartDto: UpdateCartItemDto): Promise<Cart> {

    const userId = req.user.id;

    return this.cartService.update(userId, id, updateCartDto);

  }



  @Delete(':id')

  remove(@Request() req, @Param('id') id: string): Promise<{ message: string }> {

    const userId = req.user.id;

    return this.cartService.remove(userId, id);

  }

}


