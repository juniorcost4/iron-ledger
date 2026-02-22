import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../../../domain/entities/account.entity';

export class OpenAccountDto {
  @ApiProperty({
    description: 'ID do usuário dono da conta',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    description: 'CPF ou CNPJ (apenas números)',
    example: '12345678900',
  })
  document!: string;

  @ApiProperty({
    description: 'Nome completo ou razão social',
    example: 'João da Silva',
  })
  fullName!: string;

  @ApiProperty({
    description: 'Tipo da conta',
    enum: ['COMMON', 'MERCHANT'],
    example: 'COMMON',
  })
  type!: AccountType;
}
