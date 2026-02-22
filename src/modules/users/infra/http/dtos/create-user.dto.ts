import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario@exemplo.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Senha em texto plano (será tratada com segurança no backend)',
    example: 'senhaSegura123',
    minLength: 8,
  })
  passwordRaw!: string;
}
