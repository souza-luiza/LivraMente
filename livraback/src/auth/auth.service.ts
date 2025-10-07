import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const { username, email, senha } = createUserDto;
    const existingUser = await this.usersService.getByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email em uso');
    }
    const existingUsername = await this.usersService.getByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Nome de usuário em uso');
    }
    
    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(senha, salt, 32) as Buffer;
    const saltAndHash = `${salt}.${hash.toString('hex')}`;

    const user = await this.usersService.create({
      username,
      email,
      senha: saltAndHash,
    });

    const payload = { email: user.email, sub: user._id };
    return { accessToken: this.jwtService.sign(payload) }; //transforma payload em token JWT
  }
}
