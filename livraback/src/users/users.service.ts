import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
    private readonly users: User[] = []; // provisório

    create(user: User) {
        this.users.push(user);
    }

    findAll(): User[] {
        return this.users;
    }
}
