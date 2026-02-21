import { Module } from '@nestjs/common';
import { UsersController } from './infra/http/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { PrismaUserRepository } from './infra/database/prisma-user.repository';
import { PrismaAccountRepository } from '../accounts/infra/database/prisma-account.repository';
import { ListUserAccountsUseCase } from './application/use-cases/list-users-accounts.use-case';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    ListUserAccountsUseCase,
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'IAccountRepository',
      useClass: PrismaAccountRepository,
    },
  ],
})
export class UsersModule {}
