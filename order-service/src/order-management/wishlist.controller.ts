import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistItemDto } from './dto/create-wishlist-item.dto';
import { MongooseClassSerializerInterceptor } from './mongoose-class-serializer.interceptor';
import { WishlistResponseDto } from './dto/wishlist-response.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Wishlist } from './schemas/wishlist.schema';

@UseGuards(JwtAuthGuard)
@Controller('wishlists')
@UseInterceptors(MongooseClassSerializerInterceptor(WishlistResponseDto))
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  create(@Request() req, @Body() createWishlistDto: CreateWishlistItemDto) {
    return this.wishlistService.create(req.user.id, createWishlistDto);
  }

  @Get()
  findAllByUser(@Request() req) {
    return this.wishlistService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.wishlistService.findOne(req.user.id, id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string): Promise<{ message: string }> {
    return this.wishlistService.remove(req.user.id, id);
  }
}