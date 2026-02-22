import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'ID da conta que receberá o depósito',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  accountId!: string;

  @ApiProperty({
    description: 'Valor do depósito em centavos',
    example: 10000,
    minimum: 1,
  })
  value!: number;
}
