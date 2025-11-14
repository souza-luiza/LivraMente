import { forwardRef, Module } from '@nestjs/common';
import { ReadlistsController } from './readlists.controller';
import { ReadlistsService } from './readlists.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Readlist, ReadlistSchema } from './entities/readlist.entity';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: Readlist.name, schema: ReadlistSchema },
      { name: User.name, schema: UserSchema },
    ])],
  controllers: [ReadlistsController],
  providers: [ReadlistsService],
  exports: [ReadlistsService]
})
export class ReadlistsModule {}
