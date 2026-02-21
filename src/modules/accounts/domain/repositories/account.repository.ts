import { Account } from '../entities/account.entity';

export interface IAccountRepository {
  create(account: Account): Promise<void>;
  findById(id: string): Promise<Account | null>;
  findByDocument(document: string): Promise<Account | null>;
  findAllByUserId(userId: string): Promise<Account[]>;

  updateBalance(accountId: string, amount: number): Promise<void>;
}
