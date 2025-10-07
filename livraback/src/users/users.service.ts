import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {} // dentro dessa variavel tem todos os metodos do mongo

  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto); // insere variaveis no modelo
    return await user.save(); // salva usuario
  }

  async findAll() {
    return await this.userModel.find().exec(); // retorna lista
  }

  async findOne(id: string) { // id do mongo eh uma string
    return await this.userModel.findById(id).exec();
  }

  async getByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async getByUsername(username: string) {
    return await this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(
      {
        _id: id, // procurar objeto por id (mongo por padrao cria id com _)
      }, 
      {
        $set: updateUserDto, // o que quero alterar (set altera os campos que eu quero alterar)
      },
      {
        new: true, // alterar no banco de dados
        runValidators: true, // validação do schema no update
      },
    ).exec();
  }

  async remove(id: string) {
    return await this.userModel.deleteOne({
      _id: id,
    }).exec(); // para executar operacao
  }
}
