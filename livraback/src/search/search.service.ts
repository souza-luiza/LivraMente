import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { Readlist, ReadlistDocument } from '../readlists/entities/readlist.entity';
import { Comunidade, ComunidadeDocument } from '../comunidades/entities/comunidade.entity';
import { Livro, LivroDocument } from '../livros/entities/livro.schema';
import { Autor, AutorDocument } from '../livros/entities/autor.schema';

export type TipoResultado = 'user' | 'comunidade' | 'readlist' | 'livro';

export interface CandidatoResultado {
    tipo: TipoResultado;
    item: UserDocument | ReadlistDocument | ComunidadeDocument | LivroDocument;
    score: number;
};

@Injectable()
export class SearchService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(Readlist.name) private readonly readlistModel: Model<ReadlistDocument>,
        @InjectModel(Comunidade.name) private readonly comunidadeModel: Model<ComunidadeDocument>,
        @InjectModel(Livro.name) private readonly livroModel: Model<LivroDocument>,
        @InjectModel(Autor.name) private readonly autorModel: Model<AutorDocument>,
    ) {}

    async search(query: string) {
        if(!query) return null;

        const regexInsensitive = RegExp(query, 'i'); // ignora maisculas e minusculas

        let [users, comunidades, readlists, livros] = await Promise.all([
            this.userModel.find({ username: regexInsensitive }).select('username avatarUrl readlists').limit(5), // 5 eh o numero maximo de resultados para retornar
            this.comunidadeModel.find({ nome: regexInsensitive }).select('nome imagem_url').limit(5),
            this.readlistModel.find({ nome: regexInsensitive, publica: true }).select('nome capa_url slug criador').populate('criador', 'username -_id').limit(5),
            this.livroModel.find({ titulo: regexInsensitive }).select('titulo autores capa_url').populate('autores', 'nome -_id').limit(5),
        ]);

        // Adicionando readlists que pertençam aos users encontrados
        const idsReadlistsDosUsers = users.flatMap(u => u.readlists || []);
        const readlistsDosUsers = await this.readlistModel.find({ _id: { $in: idsReadlistsDosUsers }, publica: true }).select('nome capa_url slug criador').populate('criador', 'username -_id').limit(5);
        readlists = readlists.concat(readlistsDosUsers);

        // Buscar livros por autor
        const autores = await this.autorModel.find({ nome: regexInsensitive }).select('_id').limit(5);
        if(autores.length > 0) {
            const autoresIds = autores.map(a => a._id);
            const livrosDoAutor = await this.livroModel.find({ autores: { $in: autoresIds } }).select('titulo autores capa_url').limit(5);
            livros = livros.concat(livrosDoAutor);
        }

        const melhorResultado = this.getMelhorResultado(query, { users, comunidades, readlists, livros });

        if(melhorResultado) { // para melhorResultado nao aparecer duplicado
            if(melhorResultado.tipo === 'user') users = users.filter(u => !u._id.equals((melhorResultado.item as UserDocument)._id));
            if(melhorResultado.tipo === 'comunidade') comunidades = comunidades.filter(c => !c._id.equals((melhorResultado.item as ComunidadeDocument)._id));
            if(melhorResultado.tipo === 'readlist') readlists = readlists.filter(r => !r._id.equals((melhorResultado.item as ReadlistDocument)._id));
            if(melhorResultado.tipo === 'livro') livros = livros.filter(l => !l._id.equals((melhorResultado.item as LivroDocument)._id));
        }

        return {
            melhorResultado,
            users,
            comunidades,
            readlists,
            livros
        };
    }

    getMelhorResultado(query: string, data: { users: UserDocument[], comunidades: ComunidadeDocument[], readlists: ReadlistDocument[], livros: LivroDocument[] }): CandidatoResultado | null {
        const score = (text: string) => {
            if(!text) return 0;
            const lower = text.toLowerCase();
            const q = query.toLowerCase();

            if(lower === q) return 3; // match exato
            if(lower.startsWith(q)) return 2; //começa com
            if(lower.includes(q)) return 1; //contem
            return 0;
        };

        let candidatos: CandidatoResultado[] = [];
        data.users.forEach(u => candidatos.push({ tipo: 'user', item: u, score: score(u.username) }));
        data.comunidades.forEach(c => candidatos.push({ tipo: 'comunidade', item: c, score: score(c.nome) }));
        data.readlists.forEach(r => candidatos.push({ tipo: 'readlist', item: r, score: score(r.nome) }));
        data.livros.forEach(l => candidatos.push({ tipo: 'livro', item: l, score: score(l.titulo) }));

        // ordena por melhor score
        candidatos.sort((a, b) => b.score - a.score);

        return candidatos[0] ?? null;
    }
}
