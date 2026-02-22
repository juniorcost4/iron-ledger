export type OperationType = 'DEBIT' | 'CREDIT';

export class LedgerEntry {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly amount: number,
    public readonly operation: OperationType,
    public readonly description: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    accountId: string;
    amount: number;
    operation: OperationType;
    description: string;
  }): LedgerEntry {
    return new LedgerEntry(
      crypto.randomUUID(),
      props.accountId,
      props.amount,
      props.operation,
      props.description,
      new Date(),
    );
  }
}
