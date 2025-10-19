import { ApiProperty} from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @ApiProperty({ description: 'Nome de usuário único', required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ description: 'E-mail único', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;
}
