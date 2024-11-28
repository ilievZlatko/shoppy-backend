import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { CreateUserRequest } from './dto/create-user.request';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismeService: PrismaService) {}

  async createUser(data: CreateUserRequest): Promise<Omit<User, 'password'>> {
    try {
      return await this.prismeService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10),
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          password: false,
        },
      });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }
      throw error;
    }
  }

  async getUser(filter: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return await this.prismeService.user.findUniqueOrThrow({
      where: filter,
    });
  }
}
