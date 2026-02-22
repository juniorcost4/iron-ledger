import { Injectable } from '@nestjs/common';
import { Account as PrismaAccount } from '@prisma/client';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { IAccountRepository } from '../../domain/repositories/account.repository';
import { Account, AccountType } from '../../domain/entities/account.entity';

@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaAccount: PrismaAccount): Account {
    return Account.create(
      {
        userId: prismaAccount.userId,
        document: prismaAccount.document,
        fullName: prismaAccount.fullName,
        type: prismaAccount.type as AccountType,
        balance: prismaAccount.balance,
      },
      prismaAccount.id,
    );
  }

  async create(account: Account): Promise<void> {
    await this.prisma.account.create({
      data: {
        id: account.id,
        userId: account.userId,
        document: account.document,
        fullName: account.fullName,
        type: account.type,
        balance: account.balance,
      },
    });
  }

  async findByDocument(document: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { document },
    });
    return prismaAccount ? this.toDomain(prismaAccount) : null;
  }

  async findById(id: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { id },
    });
    return prismaAccount ? this.toDomain(prismaAccount) : null;
  }

  async findAllByUserId(userId: string): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: { userId },
    });
    return accounts.map((acc) => this.toDomain(acc)) as Account[];
  }
}
