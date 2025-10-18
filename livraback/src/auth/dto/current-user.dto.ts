import { ApiProperty } from "@nestjs/swagger";

export class CurrentUserDto {
    @ApiProperty({ description: 'ID do usuário' })
    userId: string;

    @ApiProperty({ description: 'Email do usuário' })
    email: string;
}