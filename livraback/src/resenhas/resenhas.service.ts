import { BadRequestException, ForbiddenException, NotFoundException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Livro, LivroDocument } from "../livros/entities/livro.schema";
import { Resenha, ResenhaDocument } from "./entities/resenha.schema";
import { CreateResenhaDto } from "./dto/create-resenha.dto";
import { UpdateResenhaDto } from "./dto/update-resenha.dto";

@Injectable()
export class ResenhasService {
    constructor(
        @InjectModel(Resenha.name) private resenhaModel: Model<ResenhaDocument>,
        @InjectModel(Livro.name) private livroModel: Model<LivroDocument>,
    ) {}

    // Listar todas as resenhas de um livro
    async getResenhasByBook(bookId: string) {
        const book = await this.livroModel.findById(bookId);
        if (!book) throw new NotFoundException('Livro não encontrado');

        const resenhas = await this.resenhaModel
        .find({ livro: bookId })
        .sort({ createdAt: -1 })
        .populate('autor', 'username avatarUrl')
        .lean();

        return resenhas;
    }

    // Criar resenha
    async createResenha(userId: string, bookId: string, createResenhaDto: CreateResenhaDto) {
        const book = await this.livroModel.findById(bookId);
        if (!book) throw new NotFoundException('Livro não encontrado');

        // verificar se o usuário já tem uma resenha para este livro
        const existingResenha = await this.resenhaModel.findOne({
            autor: userId,
            livro: bookId
        });

        const newResenha = await this.resenhaModel.create({
            ...createResenhaDto,
            livro: bookId,
            autor: userId,
        });

        await this.livroModel.findByIdAndUpdate(
            book._id,
            { $push: { resenhas: newResenha._id } }
        );

        return newResenha;
    }

    // Atualizar resenha
    async updateResenha(userId: string, resenhaId: string, updateResenhaDto: UpdateResenhaDto) {
        
        // buscar a resenha primeiro
        const resenha = await this.resenhaModel.findById(resenhaId);
        if (!resenha) throw new NotFoundException('Resenha não encontrada');

        // Verificar se o usuário é o autor
        if (resenha.autor.toString() !== userId.toString()) {
            throw new ForbiddenException('Somente o autor da resenha pode atualizá-la');
        }

        const updated = await this.resenhaModel
            .findByIdAndUpdate(
                resenhaId,
                { $set: updateResenhaDto },
                { new: true }
            )
            .populate('autor', 'username avatarUrl');

        return updated;
    }


    // Apagar resenha
    async deleteResenha(userId: string, resenhaId: string) {
        const resenha = await this.resenhaModel.findById(resenhaId);
        if (!resenha) throw new NotFoundException('Resenha não encontrada');

        if (resenha.autor.toString() !== userId) throw new ForbiddenException('Somente o autor da resenha pode apagá-la');

        const livro = await this.livroModel.findById(resenha.livro);
        if (!livro) throw new NotFoundException('Livro não encontrado');

        await Promise.all([
            this.resenhaModel.findByIdAndDelete(resenhaId),
            this.livroModel.findByIdAndUpdate(
                resenha.livro,
                { $pull: { resenhas: resenha._id } }
            ),
        ]);

        return { message: 'Resenha apagada com sucesso' };
    }
    
    // Buscar uma resenha por ID
    async getResenhaById(resenhaId: string) {
        const resenha = await this.resenhaModel
            .findById(resenhaId)
            .populate('autor', 'username avatarUrl')
            .lean();
        if (!resenha) throw new NotFoundException('Resenha não encontrada');
            return resenha;
    }
}