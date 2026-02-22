import { Module } from '@nestjs/common';
import { TransactionsController } from './infra/http/transactions.controller';
import { DepositUseCase } from './application/use-cases/deposit.use-case';
import { AccountsModule } from '../accounts/accounts.module';
import { PrismaAccountRepository } from '../accounts/infra/database/prisma-account.repository';
import { PrismaTransactionRepository } from './infra/database/prisma-transaction.repository';
import { TransferUseCase } from './application/use-cases/transfer.use-case';

@Module({
  imports: [AccountsModule],
  controllers: [TransactionsController],
  providers: [
    DepositUseCase,
    TransferUseCase,
    {
      provide: 'IAccountRepository',
      useClass: PrismaAccountRepository,
    },
    {
      provide: 'ITransactionRepository',
      useClass: PrismaTransactionRepository,
    },
  ],
})
export class TransactionsModule {}
