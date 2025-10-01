import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {} // dentro dessa variavel tem todos os metodos do mongo

  create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto); // insere variaveis no modelo
    return user.save(); // salva usuario
  }

  findAll() {
    return this.userModel.find(); // retorna lista
  }

  findOne(id: string) { // id do mongo eh uma string
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(
      {
        _id: id, // procurar objeto por id (mongo por padrao cria id com _)
      }, 
      {
        $set: updateUserDto, // o que quero alterar (set altera os campos que eu quero alterar)
      },
      {
        new: true, // alterar no banco de dados
      },
    );
  }

  remove(id: string) {
    return this.userModel.deleteOne({
      _id: id,
    }).exec(); // para executar operacao
  }
}
