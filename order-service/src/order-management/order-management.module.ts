import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { JwtStrategy } from './auth/jwt.strategy';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Wishlist.name, schema: WishlistSchema },
    ]),
  ],
  controllers: [CartController, OrderController, WishlistController],
  providers: [CartService, OrderService, WishlistService, JwtStrategy, RolesGuard],
})
export class OrderManagementModule {}