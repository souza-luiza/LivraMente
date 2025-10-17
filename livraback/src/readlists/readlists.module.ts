import { Module } from '@nestjs/common';
import { ReadlistsController } from './readlists.controller';
import { ReadlistsService } from './readlists.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Readlist, ReadlistSchema } from './entities/readlist.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Readlist.name, schema: ReadlistSchema }])],
  controllers: [ReadlistsController],
  providers: [ReadlistsService]
})
export class ReadlistsModule {}
