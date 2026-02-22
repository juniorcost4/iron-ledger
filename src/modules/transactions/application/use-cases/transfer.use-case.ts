import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { IAccountRepository } from '../../../../modules/accounts/domain/repositories/account.repository';

export interface TransferDto {
  payerId: string;
  payeeId: string;
  value: number;
}

@Injectable()
export class TransferUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(data: TransferDto & { idempotencyKey: string }) {
    const payerAccount = await this.accountRepository.findById(data.payerId);
    if (!payerAccount) {
      throw new BadRequestException('Conta pagadora não encontrada');
    }

    if (!payerAccount.canSendMoney()) {
      throw new ForbiddenException(
        'Contas PJ não podem realizar transferências',
      );
    }

    if (!payerAccount.hasEnoughBalance(data.value)) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const isAuthorized = await this.mockAuthorize();
    if (!isAuthorized) {
      throw new ForbiddenException('Transferência não autorizada externamente');
    }

    await this.transactionRepository.transfer({
      senderId: data.payerId,
      receiverId: data.payeeId,
      amount: data.value,
      idempotencyKey: data.idempotencyKey,
    });

    return { message: 'Transferência concluída com sucesso!' };
  }

  private async mockAuthorize(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
