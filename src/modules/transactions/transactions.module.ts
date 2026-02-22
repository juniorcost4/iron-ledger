import { Module } from '@nestjs/common';
import { TransactionsController } from './infra/http/transactions.controller';
import { DepositUseCase } from './application/use-cases/deposit.use-case';
import { AccountsModule } from '../accounts/accounts.module';
import { PrismaAccountRepository } from '../accounts/infra/database/prisma-account.repository';
import { PrismaTransactionRepository } from './infra/database/prisma-transaction.repository';
import { TransferUseCase } from './application/use-cases/transfer.use-case';
import { GetStatementUseCase } from './application/use-cases/get-statement.use-case';
import { PrismaLedgerRepository } from './infra/database/prisma-ledger.repository';
import { RedisModule } from '../../infra/redis/redis.module';

@Module({
  imports: [AccountsModule, RedisModule],
  controllers: [TransactionsController],
  providers: [
    DepositUseCase,
    TransferUseCase,
    GetStatementUseCase,
    {
      provide: 'IAccountRepository',
      useClass: PrismaAccountRepository,
    },
    {
      provide: 'ITransactionRepository',
      useClass: PrismaTransactionRepository,
    },
    {
      provide: 'ILedgerRepository',
      useClass: PrismaLedgerRepository,
    },
  ],
})
export class TransactionsModule {}
