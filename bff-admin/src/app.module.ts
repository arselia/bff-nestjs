import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BffAdminModule } from './bff-admin/bff-admin.module';
import { APP_GUARD } from '@nestjs/core';
import { InternalAuthGuard } from './auth/internal-auth.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BffAdminModule],
  controllers: [],
  providers: [
    InternalAuthGuard, // Register the guard as a provider
    {
      provide: APP_GUARD,
      useClass: InternalAuthGuard,
    },
  ],
})
export class AppModule {}
