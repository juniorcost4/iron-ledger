export type AccountType = 'COMMON' | 'MERCHANT';

export class Account {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public document: string,
    public fullName: string,
    public type: AccountType,
    private _balance: number,
  ) {}

  static create(
    props: {
      userId: string;
      document: string;
      fullName: string;
      type: AccountType;
      balance?: number;
    },
    id?: string,
  ): Account {
    return new Account(
      id ?? crypto.randomUUID(),
      props.userId,
      props.document,
      props.fullName,
      props.type,
      props.balance ?? 0,
    );
  }

  get balance(): number {
    return this._balance;
  }

  canSendMoney(): boolean {
    return this.type === 'COMMON';
  }

  hasEnoughBalance(amount: number): boolean {
    return this._balance >= amount;
  }
}
