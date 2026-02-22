import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { DepositUseCase } from '../../application/use-cases/deposit.use-case';
import { DepositDto } from './dtos/deposit.dto';
import { TransferDto } from './dtos/transfer.dto';
import { TransferUseCase } from '../../application/use-cases/transfer.use-case';
import { GetStatementUseCase } from '../../application/use-cases/get-statement.use-case';
import { IdempotencyInterceptor } from '../../../../infra/common/interceptors/idempotency.interceptor';

@UseInterceptors(IdempotencyInterceptor)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
    private readonly transferUseCase: TransferUseCase,
    private readonly getStatementUseCase: GetStatementUseCase,
  ) {}

  @Post('deposit')
  async deposit(
    @Body() body: DepositDto,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    return await this.depositUseCase.execute({ ...body, idempotencyKey });
  }

  @Post('transfer')
  async transfer(
    @Body() body: TransferDto,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    return await this.transferUseCase.execute({ ...body, idempotencyKey });
  }

  @Get('statement/:accountId')
  async getStatement(@Param('accountId') accountId: string) {
    return await this.getStatementUseCase.execute(accountId);
  }
}
