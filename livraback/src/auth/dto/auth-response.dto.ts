import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({ description: 'Token JWT de acesso do usuário' })
    accessToken: string;
}