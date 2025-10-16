import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Readlist, ReadlistDocument } from './entities/readlist.entity';
import { Model } from 'mongoose';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';

@Injectable()
export class ReadlistsService {

    constructor(@InjectModel(Readlist.name) private readonly readlistModel: Model<ReadlistDocument>) {}

    async create(criadorId: string, createReadlistDto: CreateReadlistDto) {
        const readlist = new this.readlistModel({...createReadlistDto, criador: criadorId});
        return await readlist.save();
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
        try{
            const removed = await this.readlistModel.deleteOne({
                _id: id,
                criador: criadorId
            }).exec();
            if(removed.deletedCount==0){
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
    
    // Busca readlists públicas de um usuário pelo username
    async findPublicByUsername(username: string) {
        // Importa o modelo User dinamicamente para evitar dependência circular
        const userModel = this.readlistModel.db.model('User');
        const user = await userModel.findOne({ username }).exec();
        if (!user) return [];
        return await this.readlistModel.find({ criador: user._id, publica: true }).exec();
    }
    // Busca readlists favoritedas por um usuário
    async findFavoritedByUser(userId: string) {
        return await this.readlistModel.find({ favoritadoPor: userId, publica: true }).exec();
    }
}
