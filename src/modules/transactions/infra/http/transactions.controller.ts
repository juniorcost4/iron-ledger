import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { DepositUseCase } from '../../application/use-cases/deposit.use-case';
import { DepositDto } from './dtos/deposit.dto';
import { TransferDto } from './dtos/transfer.dto';
import { TransferUseCase } from '../../application/use-cases/transfer.use-case';
import { GetStatementUseCase } from '../../application/use-cases/get-statement.use-case';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
    private readonly transferUseCase: TransferUseCase,
    private readonly getStatementUseCase: GetStatementUseCase,
  ) {}

  @Post('deposit')
  async deposit(@Body() body: DepositDto) {
    return await this.depositUseCase.execute(body);
  }

  @Post('transfer')
  async transfer(@Body() body: TransferDto) {
    return await this.transferUseCase.execute(body);
  }

  @Get('statement/:accountId')
  async getStatement(@Param('accountId') accountId: string) {
    return await this.getStatementUseCase.execute(accountId);
  }
}
