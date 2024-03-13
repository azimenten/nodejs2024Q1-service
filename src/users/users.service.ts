import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userDb } from 'src/db/users.db';
import { v4 as uuidv4, validate } from 'uuid';

@Injectable()
export class UsersService {
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

    return userDb.addUser(newUser);
  }

  findAll() {
    return userDb.getUsers();
  }

  findOne(id: string) {
    if (!validate(id)) throw new BadRequestException('Invalid id (not uuid)');
    const user = userDb.getUserById(id);
    if (!user) {
      throw new NotFoundException('Not found user');
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }

    if (!updateUserDto.oldPassword && !updateUserDto.newPassword) {
      throw new BadRequestException(
        'Old password or new password is not defined',
      );
    }

    const user = userDb.getUserByIdWithPassword(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.oldPassword !== user.password) {
      throw new ForbiddenException('oldPassword is wrong');
    }
    const updatedVersion = user.version + 1;
    const newPassword = updateUserDto.newPassword;

    const updatedUser = {
      ...user,
      password: newPassword,
      updatedAt: Date.now(),
      version: updatedVersion,
    };
    userDb.updateUserById(id, updatedUser);
    const result = { ...updatedUser };

    delete result.password;
    return result;
  }

  remove(id: string) {
    if (!validate(id)) {
      throw new BadRequestException('invalid id (not uuid)');
    }
    const user = userDb.getUserById(id);
    if (!user) {
      throw new NotFoundException('userId does not exist');
    }
    userDb.deleteUser(id);
  }
}
