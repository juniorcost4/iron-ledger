import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async transfer(data: {
    senderId: string;
    receiverId: string;
    amount: number;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const [payer]: any[] = await tx.$queryRaw`
        SELECT balance FROM "Account" WHERE id = ${data.senderId} FOR UPDATE
      `;

      if (!payer || payer.balance < data.amount) {
        throw new Error('Saldo insuficiente ou conta não encontrada');
      }

      await tx.account.update({
        where: { id: data.senderId },
        data: { balance: { decrement: data.amount } },
      });

      await tx.account.update({
        where: { id: data.receiverId },
        data: { balance: { increment: data.amount } },
      });
    });
  }
}
