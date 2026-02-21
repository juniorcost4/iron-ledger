import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User, UserType } from '../../domain/entities/user.entity';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // MAPPER: Traduz o modelo sujo do Prisma para a nossa Entidade Pura do Domínio.
  private toDomain(prismaUser: any): User {
    return User.create(
      {
        fullName: prismaUser.fullName,
        document: prismaUser.document,
        email: prismaUser.email,
        passwordHash: prismaUser.password,
        type: prismaUser.type as UserType,
      },
      prismaUser.id,
    );
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        fullName: user.fullName,
        document: user.document,
        email: user.email,
        password: user.passwordHash,
        type: user.type,
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

  async findByDocument(document: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { document },
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
