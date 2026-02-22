import { LedgerEntry } from '../entities/ledger-entry.entity';

export interface ILedgerRepository {
  findAllByAccountId(accountId: string): Promise<LedgerEntry[]>;
}
