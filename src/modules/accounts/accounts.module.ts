import { Module } from '@nestjs/common';
import { AccountsController } from './infra/http/accounts.controller';
import { OpenAccountUseCase } from './application/use-cases/open-account.use-case';
import { PrismaAccountRepository } from './infra/database/prisma-account.repository';

@Module({
  controllers: [AccountsController],
  providers: [
    OpenAccountUseCase,
    {
      provide: 'IAccountRepository',
      useClass: PrismaAccountRepository,
    },
  ],
  exports: [OpenAccountUseCase],
})
export class AccountsModule {}
