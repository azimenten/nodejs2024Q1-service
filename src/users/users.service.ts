import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { users } from 'src/db/users.db';
import { User } from './interfaces/user.interface';
import { v4 as uuidv4, validate } from 'uuid';

@Injectable()
export class UsersService {
  private users: User[] = users;
  create(createUserDto: CreateUserDto) {
    if (!createUserDto.login || !createUserDto.password) {
      throw new BadRequestException('body does not contain required fields');
    }

    const newUser = {
      id: uuidv4(),
      login: createUserDto.login,
      password: createUserDto.password,
      version: 1,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
    };

    this.users.push(newUser);
    return this.users;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }

    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException('userId does not exist');
    }

    if (user) {
      return user;
    }
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    if (!this.users.find((user) => user.id === id)) {
      throw new NotFoundException('userId does not exist');
    }

    const index = this.users.findIndex((user) => user.id === id);
    if (this.users[index].password !== updateUserDto.oldPassword) {
      throw new ForbiddenException('oldPassword is wrong');
    }

    if (this.users[index].password === updateUserDto.oldPassword) {
      this.users[index].password = updateUserDto.newPassword;
      this.users[index].version = this.users[index].version + 1;
      return this.users[index];
    }
  }

  remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    if (!this.users.find((user) => user.id === id)) {
      throw new NotFoundException('userId does not exist');
    }
    if (this.users.find((user) => user.id === id)) {
      this.users = this.users.filter((user) => user.id !== id);
    }
    return;
  }
}
