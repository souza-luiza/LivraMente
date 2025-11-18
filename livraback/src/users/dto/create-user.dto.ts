import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto { // objeto com informações que queremos salvar
    @ApiProperty({ description: 'Nome de usuário único' })
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    username: string;

    @ApiProperty({ description: 'E-mail válido e único' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Senha do usuário' })
    @IsNotEmpty()
    @MinLength(6) // pelo menos 6 letras na senha
    senha: string;
} 
    
