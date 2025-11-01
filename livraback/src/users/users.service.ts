import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Readlist, ReadlistDocument } from '../readlists/entities/readlist.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Readlist.name) private readonly readlistModel: Model<ReadlistDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {} // dentro dessa variavel tem todos os metodos do mongo

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
    const { email, username } = updateUserDto;

    // Verifica se já existe user com msm email (excluindo o próprio usuário):
    if(email) {
      const emailExists = await this.userModel.findOne({ 
        email,
        _id: { $ne: id } // Exclui o próprio usuário da busca
      }).exec();
      
      if(emailExists) {
        throw new ConflictException('E-mail já está em uso');
      }
    }

    // Verifica se já existe user com msm username (excluindo o próprio usuário):
    if(username) {
      const usernameExists = await this.userModel.findOne({ 
        username,
        _id: { $ne: id } // Exclui o próprio usuário da busca
      }).exec();
      
      if(usernameExists) {
        throw new ConflictException('Nome de usuário já está em uso');
      }
    }

    const updated = await this.userModel.findByIdAndUpdate(
      {
        _id: id,
      }, 
      {
        $set: updateUserDto,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('-senha').exec();

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    return updated;
  }

  async remove(id: string) {
    return await this.userModel.deleteOne({
      _id: id,
    }).exec(); // para executar operacao
  }

  async registroLeitura(id: string, opcao: number, qtd: number) {
    const user = await this.findOne(id);
    //if(!user) throw new NotFoundException('Usuário não encontrado'); isso ja eh verificado na funcao findOne

    if(!user.gamificação) { // inicializa xp/nivel
      user.gamificação = { nivel: 1, XP: 0, XP_proximo_nivel: 100 }
    }

    let ganhoXP: number = 0; // XP ganho por leitura

    if(opcao === 0) { // opcao de paginas lidas
      ganhoXP = qtd; // +1 XP por pagina
    }
    else if (opcao === 1) { // opcao de minutos lidos
      ganhoXP = Math.floor(qtd/2); // +1 XP por 2 minutos, arredondado para baixo
    }

    if(ganhoXP > 60) { // limite de XP diario
      ganhoXP = 60;
    }

    user.gamificação.XP += ganhoXP;

    // Lógica para subir de nível
    while (user.gamificação.XP >= user.gamificação.XP_proximo_nivel) { // se tem XP necessario para subir de nivel (while para multiplos level-ups)
      user.gamificação.nivel += 1;
      user.gamificação.XP -= user.gamificação.XP_proximo_nivel;
      if (user.gamificação.nivel < 5)
        user.gamificação.XP_proximo_nivel += 100;
      else if (user.gamificação.nivel < 9)
        user.gamificação.XP_proximo_nivel += 150;
      else if (user.gamificação.nivel < 13)
        user.gamificação.XP_proximo_nivel += 200;
      else {
        user.gamificação.XP_proximo_nivel += 250;
      }
    }

    await this.userModel.updateOne({ _id: id }, { $set: { gamificação: user.gamificação } });
    return { ganhoXP };
  }

  async favoritarReadlist(userId: string, readlistId: string) {
    const user = await this.findOne(userId);

    const readlist = await this.readlistModel.findById(readlistId);
    if (!readlist) throw new NotFoundException('Readlist não encontrada');
    if (readlist.criador.toString() === userId) throw new BadRequestException('Readlist é do próprio usuário');
    if (!readlist.publica) throw new BadRequestException('Readlist não é pública');

    if (user.readlists_favoritas.includes(readlist._id)) throw new ConflictException('Readlist já favoritada');

    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { readlists_favoritas: readlist._id }}
    );

    return { message: 'Readlist favoritada com sucesso' }; 
  }

  async desfavoritarReadlist(userId: string, readlistId: string) {
    await this.findOne(userId); // lanca excecao se nao existir

    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { readlists_favoritas: readlistId }}
    );

    return { message: 'Readlist removida dos favoritos com sucesso' };
  }

  async findReadlistsFavoritas(userId: string) {
    const user = await this.userModel.findById(userId).populate({ path:'readlists_favoritas', select: '-favorito' }).select('readlists_favoritas').exec();
    if(!user) throw new NotFoundException('Usuário não encontrado');
    return user.readlists_favoritas;
  }

  async updateAvatar(id: string, file: Express.Multer.File) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    if (!file?.buffer) throw new BadRequestException('Arquivo inválido');

    const uploaded = await this.cloudinary.uploadImage(file.buffer, 'livra/avatars');

    // Remove avatar anterior se existir
    if (user.avatarPublicId) {
      await this.cloudinary.deleteImage(user.avatarPublicId);
    }

    user.avatarUrl = uploaded.secure_url;
    user.avatarPublicId = uploaded.public_id;
    await user.save();

    const obj = user.toObject();
    delete (obj as any).senha;
    return obj;
  }

  async getPublicByUsername(username: string) {
    const user = await this.userModel
      .findOne({ username })
      .select('username pronouns avatarUrl gamificação')
      .exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }
}
