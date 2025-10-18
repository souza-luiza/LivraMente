import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    const user = await this.userModel.findById(id).select('-senha').exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async getByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async getByUsername(username: string) {
    return await this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const {email, username } = updateUserDto;

    // Verifica se já existe user com msm email:
    if(email) { // se quer atualizar email
      const userComEmail = await this.getByEmail(email);
      if(userComEmail) {
        if(userComEmail._id.toString() !== id) { // se outra pessoa esta usando o email
          throw new ConflictException('Email em uso');
        }
        else { // se a propria pessoa da requisicao esta usando o email
          throw new BadRequestException('Email em uso por esta conta');
        }
      }
    }

    // Verifica se já existe user com msm username:
    if(username) { // se quer atualizar username
      const userComUsername = await this.getByUsername(username);
      if(userComUsername) {
        if(userComUsername._id.toString() !== id) { // se outra pessoa esta usando o username
          throw new ConflictException('Nome de usuário em uso');
        }
        else { // se a propria pessoa da requisicao esta usando o username
          throw new BadRequestException('Nome de usuário em uso por esta conta');
        }
      }
    }

    const updated = await this.userModel.findByIdAndUpdate(
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
    ).select('-senha').exec();

    if (!updated) throw new NotFoundException('Usuário não encontrado');
    return updated;
  }

  async remove(id: string) {
    return await this.userModel.deleteOne({
      _id: id,
    }).exec(); // para executar operacao
  }
}
