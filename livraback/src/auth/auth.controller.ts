import { Body, Controller, HttpCode, Post, Req, Res, Session } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';

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
        description: 'Faz login de um usuário e cria sessão',
    })
    @ApiResponse({
        status: 200,
        description: 'Login bem-sucedido',
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciais inválidas',
    })
    @ApiResponse({
        status: 400,
        description: 'Formatos inválidos',
    })
    async signIn(@Body() loginDto: LoginDto, @Session() session: Record<string, any>) {
        const user = await this.authService.signIn(loginDto);
        
        // salva user na sessao
        session.user = { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl };

        return { user: session.user }
    }

    @Post('logout')
    @ApiOperation({
        summary: 'Logout do usuário',
        description: 'Desloga o usuário destruindo a sessão',
    })
    async logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy(err => {
        if (err) return res.status(500).json({ message: 'Erro ao deslogar' });
            res.clearCookie('sessionId'); // nome do cookie usado na session
            return res.json({ message: 'Logout realizado com sucesso' });
        });
    }
}
