import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Readlist, ReadlistDocument } from './entities/readlist.entity';
import { Model } from 'mongoose';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';

@Injectable()
export class ReadlistsService {

    constructor(@InjectModel(Readlist.name) private readonly readlistModel: Model <ReadlistDocument>) {}

    async create(criadorId: string, createReadlistDto: CreateReadlistDto) {
        const readlist = new this.readlistModel({...createReadlistDto, criador: criadorId});
        return await readlist.save();
    }

    async findAll(criadorId: string) {
        return await this.readlistModel.find({ criador: criadorId }).exec();
    }

    async findOne(criadorId: string, id: string) {
        return await this.readlistModel.findOne({ _id: id, criador: criadorId }).exec();
    }

    async update(criadorId: string, id: string, updateReadlistDto: UpdateReadlistDto) {
        return await this.readlistModel.findOneAndUpdate(
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
    }

    async remove(criadorId: string, id: string) {
        return await this.readlistModel.deleteOne({
            _id: id,
            criador: criadorId
        }).exec();
    }
}
