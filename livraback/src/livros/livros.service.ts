import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Livro, LivroDocument } from './entities/livro.schema';
import { Model } from 'mongoose';

@Injectable()
export class LivrosService {
    constructor(
        @InjectModel(Livro.name) private readonly livroModel: Model<LivroDocument>
    ) {}

    async findAll() {
        return await this.livroModel.find().select('-sinopse -citacoes -resenhas -readlists -comunidades').exec(); //talvez só selecionar oq quero.
    }

    
}
