import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TransactionsController } from './transactions.controller';
import { DepositUseCase } from '../../application/use-cases/deposit.use-case';
import { TransferUseCase } from '../../application/use-cases/transfer.use-case';
import { GetStatementUseCase } from '../../application/use-cases/get-statement.use-case';
import { IdempotencyInterceptor } from '../../../../infra/common/interceptors/idempotency.interceptor';

const mockIdempotencyInterceptor = {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle();
  },
};

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let depositUseCase: jest.Mocked<DepositUseCase>;
  let transferUseCase: jest.Mocked<TransferUseCase>;
  let getStatementUseCase: jest.Mocked<GetStatementUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: DepositUseCase, useValue: { execute: jest.fn() } },
        { provide: TransferUseCase, useValue: { execute: jest.fn() } },
        { provide: GetStatementUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue(mockIdempotencyInterceptor)
      .compile();

    controller = module.get(TransactionsController);
    depositUseCase = module.get(DepositUseCase);
    transferUseCase = module.get(TransferUseCase);
    getStatementUseCase = module.get(GetStatementUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deposit', () => {
    it('should call deposit use case and return result', async () => {
      const body = { accountId: 'acc-123', value: 1000 };
      const idempotencyKey = 'key-456';
      const expected = {
        message: 'Depósito realizado com sucesso',
        newBalance: 1500,
      };
      depositUseCase.execute.mockResolvedValue(expected);

      const result = await controller.deposit(body, idempotencyKey);

      expect(result).toEqual(expected);
      expect(depositUseCase.execute).toHaveBeenCalledWith({
        ...body,
        idempotencyKey,
      });
    });
  });

  describe('transfer', () => {
    it('should call transfer use case and return result', async () => {
      const body = {
        payerId: 'payer-123',
        payeeId: 'payee-456',
        value: 500,
      };
      const idempotencyKey = 'key-789';
      const expected = { message: 'Transferência concluída com sucesso!' };
      transferUseCase.execute.mockResolvedValue(expected);

      const result = await controller.transfer(body, idempotencyKey);

      expect(result).toEqual(expected);
      expect(transferUseCase.execute).toHaveBeenCalledWith({
        ...body,
        idempotencyKey,
      });
    });
  });

  describe('getStatement', () => {
    it('should call getStatement use case and return entries', async () => {
      const accountId = 'acc-123';
      const entries = [
        {
          id: 'e1',
          accountId,
          amount: -100,
          operation: 'DEBIT' as const,
          description: 'Transfer',
          createdAt: new Date(),
        },
      ];
      getStatementUseCase.execute.mockResolvedValue(entries);

      const result = await controller.getStatement(accountId);

      expect(result).toEqual(entries);
      expect(getStatementUseCase.execute).toHaveBeenCalledWith(accountId);
    });
  });
});
