import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    @ApiOperation({
        summary: 'Cadastra um usuário',
        description: 'Faz registro de um novo usuário',
    })
    @ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso e token JWT do usuário retornado',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'E-mail ou nome de usuário em uso ou formatos inválidos',
    })
    async signUp(@Body() createUserDto: CreateUserDto) {
        return await this.authService.signUp(createUserDto);
    }

    @Post('signin')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Login de um usuário',
        description: 'Faz login de um usuário',
    })
    @ApiResponse({
        status: 200,
        description: 'Login bem-sucedido e token JWT do usuário retornado',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciais inválidas',
    })
    @ApiResponse({
        status: 400,
        description: 'Formatos inválidos',
    })
    async signIn(@Body() loginDto: LoginDto) {
        return await this.authService.signIn(loginDto);
    }
}
