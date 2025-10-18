import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty } from "class-validator";

export class RegistroLeituraDto {
    @ApiProperty({ description: 'Opção de registro de leitura: 0 para páginas lidas, 1 para minutos lidos)' })
    @IsNotEmpty()
    @IsIn([0, 1])
    opcao: number;

    @ApiProperty({ description: 'Quantidade de páginas ou minutos lidos' })
    @IsNotEmpty()
    @IsInt()
    qtd: number;
}