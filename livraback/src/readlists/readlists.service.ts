import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Readlist, ReadlistDocument } from './entities/readlist.entity';
import { Model } from 'mongoose';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';
import { User, UserDocument } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReadlistsService {

    constructor(
        @InjectModel(Readlist.name) private readonly readlistModel: Model<ReadlistDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly usersService: UsersService,
    ) {}

    async create(criadorId: string, createReadlistDto: CreateReadlistDto) {
        const readlist = new this.readlistModel({...createReadlistDto, criador: criadorId});
        const saved = await readlist.save();

        // Adiciona na lista de readlists do usuário:
        await this.userModel.findByIdAndUpdate(
            criadorId,
            { $push: { readlists: saved._id } },
            { new: true }
        );

        return saved;
    }

    async findAll(criadorId: string) {
        return await this.readlistModel.find({ criador: criadorId }).exec();
    }

    async findOne(criadorId: string, id: string) {
        try{
            const readlist = await this.readlistModel.findOne({ _id: id, criador: criadorId }).exec();
            if(!readlist) {
                throw new NotFoundException('Readlist não encontrada');
            }
            return readlist;
        } catch(error) {
            if(error.name === 'CastError') {
                throw new BadRequestException('ID inválido');
            }
            throw error;
        }
    }

    async update(criadorId: string, id: string, updateReadlistDto: UpdateReadlistDto) {
        try {
            const updated = await this.readlistModel.findOneAndUpdate(
                {
                    _id: id,
                    criador: criadorId
                },
                {
                    $set: updateReadlistDto,
                },
                {
                    new: true,
                    runValidators: true,
                },
            ).exec();
            if(!updated) {
                throw new NotFoundException('Readlist não encontrada');
            }
            return updated;
        } catch(error) {
            if (error.name === 'CastError') {
                throw new BadRequestException('ID inválido');
            }
            throw error;
        }
    }

    async remove(criadorId: string, id: string) {
        try {
            const removed = await this.readlistModel.deleteOne({
                _id: id,
                criador: criadorId
            }).exec();

            if(removed.deletedCount==0){
                throw new NotFoundException('Readlist não encontrada');
            }
            
            //Remove ID na lista de readlists do usuário:
            await this.userModel.findByIdAndUpdate(
                criadorId,
                { $pull: { readlists: id }}
            );

            return removed;

        } catch(error) {
            if(error.name === 'CastError') {
                throw new BadRequestException('ID inválido');
            }
            throw error;
        }
    }

    async findAllPublic(username: string) {
        const user = await this.usersService.getByUsername(username);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        const resultado = await this.userModel.findById(user._id).populate({ path:'readlists', match: { publica: true }, select: '-favorito' }).exec();
        return resultado?.readlists;
    }

    async addLivro(criadorId: string, readlistId: string, livroId: string) {
        try {
            const updated = await this.readlistModel.findOneAndUpdate(
                {
                    _id: readlistId,
                    criador: criadorId
                },
                {
                    $addToSet: { livros: livroId } // para evitar duplicatas
                },
                {
                    new: true,
                    runValidators: true
                }
            ).exec();

            if(!updated) {
                throw new NotFoundException('Readlist não encontrada');
            }
            return updated;
        } catch(error) {
            if(error.name === 'CastError') {
                throw new BadRequestException('ID inválido');
            }
            throw error;
        }
    }

    async removeLivro(criadorId: string, readlistId: string, livroId: string) {
        try {
            const removed = await this.readlistModel.findOneAndUpdate(
                {
                    _id: readlistId,
                    criador: criadorId
                },
                {
                    $pull: { livros: livroId }
                },
                {
                    new: true,
                }
            ).exec();

            if(!removed) {
                throw new NotFoundException('Readlist não encontrada');
            }
            return removed;
        } catch(error) {
            if(error.name === 'CastError') {
                throw new BadRequestException('ID inválido');
            }
            throw error;
        }
    }
}