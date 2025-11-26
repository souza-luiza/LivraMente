import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { UsersModule } from '../users/users.module';
import { ReadlistsModule } from '../readlists/readlists.module';
import { ComunidadesModule } from '../comunidades/comunidades.module';
import { LivrosModule } from '../livros/livros.module';

@Module({
    imports: [UsersModule, ReadlistsModule, ComunidadesModule, LivrosModule],
    controllers: [SearchController],
    providers: [SearchService]
})
export class SearchModule {}
