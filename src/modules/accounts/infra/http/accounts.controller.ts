import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OpenAccountUseCase } from '../../application/use-cases/open-account.use-case';
import { OpenAccountDto } from './dtos/open-account.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly openAccountUseCase: OpenAccountUseCase) {}

  @Post()
  @ApiOperation({
    summary: 'Abrir conta',
    description:
      'Abre uma nova conta Pessoa Física (COMMON) ou Pessoa Jurídica (MERCHANT) para um usuário.',
  })
  @ApiBody({ type: OpenAccountDto })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou usuário/documento já vinculado.',
  })
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
