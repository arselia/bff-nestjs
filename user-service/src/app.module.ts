import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { InternalAuthGuard } from './auth/internal-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    MongooseModule.forRoot('mongodb+srv://shersept04:admin@clusterws.idejwzk.mongodb.net/ecommerce'),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    InternalAuthGuard, // Register the guard as a provider
    {
      provide: APP_GUARD,
      useClass: InternalAuthGuard,
    },
  ],
})
export class AppModule {}
