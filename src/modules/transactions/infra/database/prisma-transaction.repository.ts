import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async deposit(data: {
    accountId: string;
    amount: number;
    idempotencyKey?: string;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Criar o registro mestre da Transação para o Depósito
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          status: 'COMPLETED',
          idempotencyKey: data.idempotencyKey,
        },
      });

      // 2. Atualizar o saldo da conta
      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: { increment: data.amount } },
      });

      // 3. Registrar a entrada no Ledger (CRÉDITO)
      await tx.ledgerEntry.create({
        data: {
          accountId: data.accountId,
          transactionId: transaction.id,
          amount: data.amount,
          operation: 'CREDIT',
        },
      });
    });
  }

  async transfer(data: {
    senderId: string;
    receiverId: string;
    amount: number;
    idempotencyKey?: string;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Criar o registro mestre da Transação
      const transaction = await tx.transaction.create({
        data: {
          amount: data.amount,
          status: 'COMPLETED',
          idempotencyKey: data.idempotencyKey,
        },
      });

      // 2. LOCK e Update do Pagador
      await tx.$queryRaw`SELECT balance FROM "Account" WHERE id = ${data.senderId} FOR UPDATE`;

      await tx.account.update({
        where: { id: data.senderId },
        data: { balance: { decrement: data.amount } },
      });

      // 3. Update do Recebedor
      await tx.account.update({
        where: { id: data.receiverId },
        data: { balance: { increment: data.amount } },
      });

      // 4. Gravar o Histórico (Ledger)
      //  Débito
      await tx.ledgerEntry.create({
        data: {
          accountId: data.senderId,
          transactionId: transaction.id,
          amount: -data.amount,
          operation: 'DEBIT',
        },
      });

      // Crédito
      await tx.ledgerEntry.create({
        data: {
          accountId: data.receiverId,
          transactionId: transaction.id,
          amount: data.amount,
          operation: 'CREDIT',
        },
      });
    });
  }
}
