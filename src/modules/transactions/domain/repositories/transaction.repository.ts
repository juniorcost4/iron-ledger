export interface ITransactionRepository {
  deposit(data: {
    accountId: string;
    amount: number;
    idempotencyKey?: string;
  }): Promise<void>;
  transfer(data: {
    senderId: string;
    receiverId: string;
    amount: number;
    idempotencyKey?: string;
  }): Promise<void>;
}
