import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto { // objeto com informações que queremos salvar
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6) // pelo menos 6 letras na senha
    senha: string;
} 
    
