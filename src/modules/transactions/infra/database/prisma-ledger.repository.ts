import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma/prisma.service';
import { ILedgerRepository } from '../../domain/repositories/ledger.repository';
import { OperationType } from '@prisma/client';

export interface StatementEntry {
  id: string;
  accountId: string;
  transactionId: string;
  amount: number;
  operation: OperationType;
  createdAt: Date;
  description: string;
}

@Injectable()
export class PrismaLedgerRepository implements ILedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByAccountId(accountId: string): Promise<StatementEntry[]> {
    const entries = await this.prisma.ledgerEntry.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });

    return entries as StatementEntry[];
  }
}
