import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({
    description: 'ID da conta do pagador',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  payerId!: string;

  @ApiProperty({
    description: 'ID da conta do recebedor',
    example: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  })
  payeeId!: string;

  @ApiProperty({
    description: 'Valor da transferência em centavos',
    example: 5000,
    minimum: 1,
  })
  value!: number;
}
