import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Readlist, ReadlistDocument } from './entities/readlist.entity';
import { Model } from 'mongoose';
import { CreateReadlistDto } from './dto/create-readlist.dto';
import { UpdateReadlistDto } from './dto/update-readlist.dto';
import { User, UserDocument } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import slugify from 'slugify';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ReadlistsService {

    constructor(
        @InjectModel(Readlist.name) private readonly readlistModel: Model<ReadlistDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService,
        private readonly cloudinary: CloudinaryService,
    ) {}

    async create(criadorId: string, createReadlistDto: CreateReadlistDto) {
        const baseSlug = slugify(createReadlistDto.nome, { lower: true, strict: true });
        let slug = baseSlug;
        let cont = 1;

        // unica slug entre readlists do usuario
        while(await this.readlistModel.exists({ slug, criador: criadorId })) {
            slug = `${baseSlug}-${cont++}`;
        }

        const readlist = new this.readlistModel({...createReadlistDto, criador: criadorId, slug });
        const saved = await readlist.save();

        // Adiciona na lista de readlists do usuario:
        await this.userModel.findByIdAndUpdate(
            criadorId,
            { $push: { readlists: saved._id } },
            { new: true }
        );

        return saved;
    }

    async findAll(criadorId: string) {
        return await this.readlistModel.find({ criador: criadorId }).select('-capa_public_id').exec();
    }

    async findOne(criadorId: string, slug: string) {
        const readlist = await this.readlistModel.findOne({ slug: slug, criador: criadorId }).exec();
        if(!readlist) throw new NotFoundException('Readlist não encontrada');
        return readlist;
    }

    async update(criadorId: string, slug: string, updateReadlistDto: UpdateReadlistDto) {
        const updated = await this.readlistModel.findOneAndUpdate(
            {
                slug: slug,
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

        if(!updated) throw new NotFoundException('Readlist não encontrada');
        
        return updated;
    }

    async remove(criadorId: string, slug: string) {
        const readlist = await this.readlistModel.findOne({ slug, criador: criadorId }).exec();
        if(!readlist) throw new NotFoundException('Readlist não encontrada');

        await this.readlistModel.deleteOne({ _id: readlist._id }).exec();
        
        //Remove ID na lista de readlists do usuario:
        await this.userModel.findByIdAndUpdate(
            criadorId,
            { $pull: { readlists: readlist._id }}
        );

        return { deleted: true, slug };
    }

    async findAllPublic(username: string) {
        const user = await this.usersService.getByUsername(username);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        const resultado = await this.userModel.findById(user._id).populate({ path:'readlists', match: { publica: true }, select: '-capa_public_id' }).exec();
        return resultado?.readlists;
    }

    async findOnePublic(username: string, slug: string) {
        const user = await this.usersService.getByUsername(username);
        if (!user) throw new NotFoundException('Usuário não encontrado');
        const readlist = await this.readlistModel.findOne({ slug: slug, criador: user._id.toString(), publica: true }).select('-capa_public_id').exec();
        if(!readlist) throw new NotFoundException('Readlist não encontrada');
        return readlist;
    }

    async updatePhoto(id: string, file: Express.Multer.File, slug: string) {
        const readlist = await this.findOne(id, slug); // se nao encontrar, funcao ja tem o throw NotFound
        if (!file?.buffer) throw new BadRequestException('Arquivo inválido');

        const uploaded = await this.cloudinary.uploadImage(file.buffer, 'livra/readlists');

        // Remove avatar anterior se existir
        if (readlist.capa_public_id) {
            await this.cloudinary.deleteImage(readlist.capa_public_id);
        }

        readlist.capa_url = uploaded.secure_url;
        readlist.capa_public_id = uploaded.public_id;
        await readlist.save();

        const obj = readlist.toObject();
        return obj;
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