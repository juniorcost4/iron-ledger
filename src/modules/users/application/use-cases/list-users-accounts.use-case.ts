import { Injectable, Inject } from '@nestjs/common';
import { IAccountRepository } from '../../../../modules/accounts/domain/repositories/account.repository';
import { Account } from '../../../../modules/accounts/domain/entities/account.entity';

@Injectable()
export class ListUserAccountsUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(userId: string): Promise<Account[]> {
    return await this.accountRepository.findAllByUserId(userId);
  }
}
