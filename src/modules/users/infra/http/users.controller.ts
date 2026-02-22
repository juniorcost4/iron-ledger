import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from './dtos/create-user.dto';
import { ListUserAccountsUseCase } from '../../application/use-cases/list-users-accounts.use-case';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUserAccountsUseCase: ListUserAccountsUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cadastra um novo usuário.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou e-mail já em uso.',
  })
  async create(@Body() body: CreateUserDto) {
    const user = await this.createUserUseCase.execute(body);

    return {
      id: user.id,
      email: user.email,
    };
  }

  @Get(':id/accounts')
  @ApiOperation({
    summary: 'Listar contas do usuário',
    description: 'Retorna todas as contas associadas ao usuário.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas retornada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
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
