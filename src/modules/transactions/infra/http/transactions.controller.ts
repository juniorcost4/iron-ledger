import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { DepositUseCase } from '../../application/use-cases/deposit.use-case';
import { DepositDto } from './dtos/deposit.dto';
import { TransferDto } from './dtos/transfer.dto';
import { TransferUseCase } from '../../application/use-cases/transfer.use-case';
import { GetStatementUseCase } from '../../application/use-cases/get-statement.use-case';
import { IdempotencyInterceptor } from '../../../../infra/common/interceptors/idempotency.interceptor';

@ApiTags('transactions')
@UseInterceptors(IdempotencyInterceptor)
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
    private readonly transferUseCase: TransferUseCase,
    private readonly getStatementUseCase: GetStatementUseCase,
  ) {}

  @Post('deposit')
  @ApiOperation({
    summary: 'Realizar depósito',
    description: 'Credita valor em uma conta.',
  })
  @ApiHeader({
    name: 'x-idempotency-key',
    description: 'Chave de idempotência para evitar duplicidade',
    required: true,
  })
  @ApiBody({ type: DepositDto })
  @ApiResponse({ status: 200, description: 'Depósito realizado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou conta não encontrada.',
  })
  async deposit(
    @Body() body: DepositDto,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    return await this.depositUseCase.execute({ ...body, idempotencyKey });
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Realizar transferência',
    description: 'Transfere valor da conta do pagador para a do recebedor.',
  })
  @ApiHeader({
    name: 'x-idempotency-key',
    description: 'Chave de idempotência para evitar duplicidade',
    required: true,
  })
  @ApiBody({ type: TransferDto })
  @ApiResponse({
    status: 200,
    description: 'Transferência realizada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos, saldo insuficiente ou regras de negócio.',
  })
  async transfer(
    @Body() body: TransferDto,
    @Headers('x-idempotency-key') idempotencyKey: string,
  ) {
    return await this.transferUseCase.execute({ ...body, idempotencyKey });
  }

  @Get('statement/:accountId')
  @ApiOperation({
    summary: 'Obter extrato',
    description: 'Retorna o extrato de transações da conta.',
  })
  @ApiParam({ name: 'accountId', description: 'ID da conta' })
  @ApiResponse({ status: 200, description: 'Extrato retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada.' })
  async getStatement(@Param('accountId') accountId: string) {
    return await this.getStatementUseCase.execute(accountId);
  }
}
