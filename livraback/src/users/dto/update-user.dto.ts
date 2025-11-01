import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({ description: 'Nome de usuário único', required: false })
    @IsOptional()
    @IsString()
    @MinLength(3)
    username?: string;

    @ApiProperty({ description: 'E-mail único', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'Senha do usuário', required: false })
    @IsOptional()
    @IsString()
    senha?: string;

    @ApiProperty({ description: 'Pronomes do usuário', required: false })
    @IsOptional()
    @IsString()
    pronouns?: string;
}
