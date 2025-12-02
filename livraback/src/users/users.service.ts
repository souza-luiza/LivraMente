import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ReadlistsService } from '../readlists/readlists.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinary: CloudinaryService,
    private readonly readlistsService: ReadlistsService
  ) {}

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

  async findOneUser(username: string) {
    const user = await this.userModel.findOne({ username }).select('-senha -_id -avatarPublicId -readlists_favoritas -readlists').exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async getByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async getByUsername(username: string) {
    return await this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto, session: Record<string, any>) {
    const { email, username } = updateUserDto;

    // Verifica se já existe user com msm email:
    if(email) { // se quer atualizar email
      const userComEmail = await this.getByEmail(email);
      if(userComEmail) {
        if(userComEmail._id.toString() !== id) { // se outra pessoa esta usando o email
          throw new ConflictException('Email em uso');
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

    if (!updated) throw new NotFoundException('Usuário não encontrado');

    session.user = { userId: updated._id, username: updated.username, email: updated.email, avatarUrl: updated.avatarUrl, pronouns: updated.pronouns };
    
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.userModel.deleteOne({
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

  async favoritarReadlist(userId: string, readlistSlug: string, username: string) {
    const user = await this.findOne(userId);

    const readlist = await this.readlistsService.findOnePublic(username, readlistSlug);
    
    if (!readlist) throw new NotFoundException('Readlist não encontrada ou não é pública');
    if (readlist.criador.toString() === userId) throw new BadRequestException('Readlist é do próprio usuário');

    if (user.readlists_favoritas.includes(readlist._id)) throw new ConflictException('Readlist já favoritada');

    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { readlists_favoritas: readlist._id }}
    );

    return { message: 'Readlist favoritada com sucesso' }; 
  }

  async desfavoritarReadlist(userId: string, readlistSlug: string, username: string) {
    await this.findOne(userId); // lanca excecao se nao existir

    const readlist = await this.readlistsService.findOnePublic(username, readlistSlug);

    if (!readlist) throw new NotFoundException('Readlist não encontrada ou não é pública');

    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { readlists_favoritas: readlist._id }}
    );

    return { message: 'Readlist removida dos favoritos com sucesso' };
  }

  async findReadlistsFavoritas(userId: string) {
    const user = await this.userModel.findById(userId).populate({ path:'readlists_favoritas', select: '-favorito', populate: { path: 'criador', select: 'username -_id' } }).select('readlists_favoritas').exec();
    if(!user) throw new NotFoundException('Usuário não encontrado');
    return user.readlists_favoritas;
  }

  async updateAvatar(id: string, file: Express.Multer.File, session: Record<string, any>) {
    const user = await this.findOne(id);
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

    session.user = { userId: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, pronouns: user.pronouns };
    const obj = user.toObject();
    delete (obj as any).senha;
    return obj;
  }
}
