import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() createUserDto: CreateUserDto) {
        return await this.authService.signUp(createUserDto);
    }

    @Post('signin')
    async signIn(@Body() loginDto: LoginDto) {
        return await this.authService.signIn(loginDto);
    }
}
