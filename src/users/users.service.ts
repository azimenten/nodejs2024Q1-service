import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { users } from 'src/db/users.db';
import { User } from './interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  private users: User[] = users;
  create(createUserDto: CreateUserDto) {
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
    return this.users.filter((user) => user.id === id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const index = this.users.findIndex((user) => user.id === id);
    if (this.users[index].password === updateUserDto.oldPassword) {
      this.users[index].password = updateUserDto.newPassword;
      this.users[index].version = this.users[index].version + 1;
    } else {
      throw new BadRequestException('oldPassword is wrong');
    }
    return this.users[index];
  }

  remove(id: string) {
    this.users = this.users.filter((user) => user.id !== id);
    return 'deleted successfully';
  }
}
