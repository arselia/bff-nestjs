import { Module, ClassSerializerInterceptor } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderManagementModule } from './order-management/order-management.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { InternalAuthGuard } from './auth/internal-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    OrderManagementModule,
    MongooseModule.forRoot('mongodb+srv://shersept04:admin@clusterws.idejwzk.mongodb.net/ecommerce'),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    InternalAuthGuard, // Register the guard as a provider
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: InternalAuthGuard,
    },
  ],
})
export class AppModule {}
