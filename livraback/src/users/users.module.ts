import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])], // name acessa o nome da classe como string
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, 
    MongooseModule, // Exporta o módulo que fornece o UserModel
  ]
})
export class UsersModule {}
