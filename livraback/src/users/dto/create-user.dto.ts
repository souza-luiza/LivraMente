import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDto { // objeto com informações que queremos salvar
    @IsEmail()
    email: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @MinLength(6) // pelo menos 6 letras na senha
    password: string;
} 
    
