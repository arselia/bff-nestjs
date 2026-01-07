import { Module } from '@nestjs/common';
import { BffAdminController } from './bff-admin.controller';
import { BffAdminService } from './bff-admin.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [BffAdminController],
  providers: [BffAdminService],
})
export class BffAdminModule {}
