import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({ description: 'Token JWT de acesso do usuário' })
    accessToken: string;

    @ApiProperty({ description: 'ID do usuário' })
    userId: string;

    @ApiProperty({ description: 'Nome de usuário' })
    username: string;
}