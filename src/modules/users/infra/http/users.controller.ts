import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    // Enviando os dados para a camada de aplicação orquestrar
    const user = await this.createUserUseCase.execute(body);

    return {
      id: user.id,
      fullName: user.fullName,
      document: user.document,
      email: user.email,
      type: user.type,
    };
  }
}
