import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BffModule } from './bff/bff.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { InternalAuthGuard } from './auth/internal-auth.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BffModule],
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
