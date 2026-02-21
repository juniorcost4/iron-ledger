export interface ITransactionRepository {
  /**
   * Executa a transferência entre duas contas usando Double-Entry.
   * Deve ser executado dentro de uma transação de banco de dados (ACID).
   */
  transfer(data: {
    senderId: string;
    receiverId: string;
    amount: number;
    idempotencyKey?: string;
  }): Promise<void>;
}
