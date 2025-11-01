import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'E-mail do usuário' })
  @IsEmail({}, { message: 'O email fornecido é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  // @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  senha: string;
}