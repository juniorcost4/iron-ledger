import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IAccountRepository } from '../../../accounts/domain/repositories/account.repository';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';

export interface DepositDto {
  accountId: string;
  value: number;
}

@Injectable()
export class DepositUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(data: DepositDto & { idempotencyKey: string }) {
    if (data.value <= 0) {
      throw new BadRequestException(
        'O valor do depósito deve ser maior que zero',
      );
    }

    const account = await this.accountRepository.findById(data.accountId);
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    await this.transactionRepository.deposit({
      accountId: data.accountId,
      amount: data.value,
      idempotencyKey: data.idempotencyKey,
    });

    return {
      message: 'Depósito realizado com sucesso',
      newBalance: account.balance + data.value,
    };
  }
}
