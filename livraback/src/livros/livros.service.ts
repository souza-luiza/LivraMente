import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Livro, LivroDocument } from './entities/livro.schema';
import { Model } from 'mongoose';

@Injectable()
export class LivrosService {
    constructor(
        @InjectModel(Livro.name) private readonly livroModel: Model<LivroDocument>
    ) {}

    async findAll() {
        return await this.livroModel.find().select('titulo isbn slug ano_publicacao numero_paginas capa_url').populate('autores', 'nome').exec();
    }

    async findOne(slug: string) {
        const livro = await this.livroModel.findOne({ slug }).populate('autores', 'nome').exec();
        if(!livro) throw new NotFoundException('Livro não encontrado');
        return livro;
    }

    async findOneReadlists(slug: string) {
        const livro = await this.livroModel.findOne({ slug }).populate('readlists').select('readlists').exec();
        if (!livro) throw new NotFoundException('Livro não encontrado');
        return livro.readlists;
    }

    async findOneComunidades(slug: string) {
        const livro = await this.livroModel.findOne({ slug }).populate('comunidades').select('comunidades').exec();
        if (!livro) throw new NotFoundException('Livro não encontrado');
        return livro.comunidades;
    }
}
