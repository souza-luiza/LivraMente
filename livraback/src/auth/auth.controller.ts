import { Body, Controller, Delete, Get, HttpCode, Post, Req, Res, Session, UnauthorizedException } from '@nestjs/common';
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
        description: 'Faz registro de um novo usuário e cria sessão',
    })
    @ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso e sessão do usuário retornada',
    })
    @ApiResponse({
        status: 400,
        description: 'E-mail ou nome de usuário em uso ou formatos inválidos',
    })
    async signUp(@Body() createUserDto: CreateUserDto, @Session() session: Record<string, any>) {
        return await this.authService.signUp(createUserDto, session);
    }

    @Post('signin')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Login de um usuário',
        description: 'Faz login de um usuário e cria sessão',
    })
    @ApiResponse({
        status: 200,
        description: 'Login bem-sucedido e sessão retornada',
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
        return await this.authService.signIn(loginDto, session);
    }

    @Get('session-info')
    @ApiOperation({
        summary: 'Retorna informações acerca da sessão do usuário',
        description: 'Retorna username, email, id e avatarUrl do usuário autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Retorno de informações bem-sucedida'
    })
    @ApiResponse({
        status: 401,
        description: 'Sessão inválida'
    })
    @ApiResponse({
        status: 500,
        description: 'Erro interno do servidor'
    })
    async getSessionInfo(@Session() session: Record<string, any>) {
        if(!session?.user) throw new UnauthorizedException('Sessão inválida');
        return session.user;
    }

    @Delete('logout')
    @ApiOperation({
        summary: 'Logout do usuário',
        description: 'Desloga o usuário destruindo a sessão',
    })
    @ApiResponse({
        status: 200,
        description: 'Deslogar bem-sucedido',
    })
    @ApiResponse({
        status: 500,
        description: 'Erro ao deslogar',
    })
    async logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy(err => {
            if (err) return res.status(500).json({ message: 'Erro ao deslogar' });
            res.clearCookie('sessionId'); // nome do cookie usado na session
            return res.json({ message: 'Logout realizado com sucesso' });
        });
    }
}
