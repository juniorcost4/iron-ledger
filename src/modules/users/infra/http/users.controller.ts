import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUserAccountsUseCase } from '../../application/use-cases/list-users-accounts.use-case';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUserAccountsUseCase: ListUserAccountsUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    // Enviando os dados para a camada de aplicação orquestrar
    const user = await this.createUserUseCase.execute(body);

    return {
      id: user.id,
      email: user.email,
    };
  }

  @Get(':id/accounts')
  async listUserAccounts(@Param('id') userId: string) {
    const accounts = await this.listUserAccountsUseCase.execute(userId);

    return accounts.map((acc) => ({
      id: acc.id,
      fullName: acc.fullName,
      document: acc.document,
      type: acc.type,
      balance: acc.balance,
    }));
  }
}
