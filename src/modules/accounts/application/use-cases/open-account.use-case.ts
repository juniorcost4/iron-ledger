import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IAccountRepository } from '../../domain/repositories/account.repository';
import { Account, AccountType } from '../../domain/entities/account.entity';

export interface OpenAccountDto {
  userId: string;
  document: string;
  fullName: string;
  type: AccountType;
}

@Injectable()
export class OpenAccountUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(data: OpenAccountDto): Promise<Account> {
    const existingAccount = await this.accountRepository.findByDocument(
      data.document,
    );

    if (existingAccount) {
      throw new BadRequestException(
        'Já existe uma conta vinculada a este documento.',
      );
    }

    const account = Account.create({
      userId: data.userId,
      document: data.document,
      fullName: data.fullName,
      type: data.type,
      balance: 0,
    });

    await this.accountRepository.create(account);

    return account;
  }
}
