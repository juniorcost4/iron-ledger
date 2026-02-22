import { Injectable, Inject } from '@nestjs/common';
import { ILedgerRepository } from '../../domain/repositories/ledger.repository';

@Injectable()
export class GetStatementUseCase {
  constructor(
    @Inject('ILedgerRepository')
    private readonly ledgerRepository: ILedgerRepository,
  ) {}

  async execute(accountId: string) {
    return await this.ledgerRepository.findAllByAccountId(accountId);
  }
}
