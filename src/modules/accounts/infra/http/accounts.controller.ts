import { Controller, Post, Body } from '@nestjs/common';
import { OpenAccountUseCase } from '../../application/use-cases/open-account.use-case';
import { OpenAccountDto } from './dtos/open-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly openAccountUseCase: OpenAccountUseCase) {}

  @Post()
  async open(@Body() body: OpenAccountDto) {
    const account = await this.openAccountUseCase.execute(body);

    return {
      id: account.id,
      userId: account.userId,
      document: account.document,
      fullName: account.fullName,
      type: account.type,
      balance: account.balance,
    };
  }
}
