import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
    @ApiProperty({ description: 'Nome de usuário único', required: false })
    @IsOptional()
    @IsString()
    @MinLength(2)
    username?: string;

    @ApiProperty({ description: 'E-mail único', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'Pronomes do usuário', required: false })
    @IsOptional()
    @IsString()
    pronouns?: string;
}
