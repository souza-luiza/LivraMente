import { Module } from '@nestjs/common';
import { CloudinaryService } from './upload.service';

@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}