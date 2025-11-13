import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { promisify } from 'util';
import { LoginDto } from './dto/login.dto';
import { timingSafeEqual } from 'crypto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async signUp(createUserDto: CreateUserDto, session: Record<string, any>) {
    const { username, email, senha } = createUserDto;
    const existingUser = await this.usersService.getByEmail(email);
    if (existingUser) throw new BadRequestException('Email em uso');
    
    const existingUsername = await this.usersService.getByUsername(username);
    if (existingUsername) throw new BadRequestException('Nome de usuário em uso');
    
    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(senha, salt, 32) as Buffer;
    const saltAndHash = `${salt}.${hash.toString('hex')}`;

    const user = await this.usersService.create({ username, email, senha: saltAndHash });

    // salva user na sessao
    session.user = { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl };

    return session.user;
  }

  async signIn(loginDto: LoginDto, session: Record<string, any>) {
    const { email, senha } = loginDto;
    const user = await this.usersService.getByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const [salt, storedHash] = user.senha.split('.');
    const hash = (await scrypt(senha, salt, 32)) as Buffer;
    const storedBuffer = Buffer.from(storedHash, 'hex');

    if (storedBuffer.length !== hash.length || !timingSafeEqual(storedBuffer, hash)) throw new UnauthorizedException('Credenciais inválidas');

    // salva user na sessao
    session.user = { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl };

    return session.user;
  }
}
