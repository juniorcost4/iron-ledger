import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // MAPPER: Traduz o modelo sujo do Prisma para a nossa Entidade Pura do Domínio.
  private toDomain(prismaUser: PrismaUser): User {
    return User.create(
      {
        email: prismaUser.email,
        passwordHash: prismaUser.password,
      },
      prismaUser.id,
    );
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        password: user.passwordHash,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!prismaUser) return null;
    return this.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) return null;
    return this.toDomain(prismaUser);
  }
}
