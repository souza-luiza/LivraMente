import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { Readlist, ReadlistSchema } from '../readlists/entities/readlist.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ReadlistsModule } from '../readlists/readlists.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Readlist.name, schema: ReadlistSchema },
    ]),
    CloudinaryModule,
    forwardRef(() => ReadlistsModule)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule]
})
export class UsersModule {}
