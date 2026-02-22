import { Controller, Post, Body } from '@nestjs/common';
import { DepositUseCase } from '../../application/use-cases/deposit.use-case';
import { DepositDto } from './dtos/deposit.dto';
import { TransferDto } from './dtos/transfer.dto';
import { TransferUseCase } from '../../application/use-cases/transfer.use-case';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
    private readonly transferUseCase: TransferUseCase,
  ) {}

  @Post('deposit')
  async deposit(@Body() body: DepositDto) {
    return await this.depositUseCase.execute(body);
  }

  @Post('transfer')
  async transfer(@Body() body: TransferDto) {
    return await this.transferUseCase.execute(body);
  }
}
