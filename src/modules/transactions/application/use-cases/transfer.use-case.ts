import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { IAccountRepository } from 'src/modules/accounts/domain/repositories/account.repository';

export interface TransferDto {
  payerId: string;
  payeeId: string;
  value: number; // Valor em centavos
}

@Injectable()
export class TransferUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(data: TransferDto) {
    const account = await this.accountRepository.findById(data.payerId);
    if (!account) throw new BadRequestException('Conta não encontrada');

    if (!account.canSendMoney()) {
      throw new ForbiddenException(
        'Lojistas não podem realizar transferências',
      );
    }

    // 2. Validar saldo (Simulado - o saldo real será validado no banco via Lock)
    // Buscamos a conta do pagador para checar o saldo atual
    // (Poderíamos adicionar findAccountByUserId no IUserRepository)

    // 3. Consulta ao Autorizador Externo (Mock do PicPay)
    // Para o projeto ficar simples, vamos apenas simular um OK por enquanto.
    const isAuthorized = await this.mockAuthorize();
    if (!isAuthorized)
      throw new ForbiddenException('Transferência não autorizada');

    // 4. Executar a transferência via Repositório (Atomicamente)
    await this.transactionRepository.transfer({
      senderId: data.payerId,
      receiverId: data.payeeId,
      amount: data.value,
    });

    return { message: 'Transferência realizada com sucesso' };
  }

  private async mockAuthorize(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
