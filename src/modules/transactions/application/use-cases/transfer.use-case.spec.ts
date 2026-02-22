import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TransferUseCase } from './transfer.use-case';
import { IAccountRepository } from '../../../../modules/accounts/domain/repositories/account.repository';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Account } from '../../../../modules/accounts/domain/entities/account.entity';

describe('TransferUseCase', () => {
  let useCase: TransferUseCase;
  let accountRepository: jest.Mocked<IAccountRepository>;
  let transactionRepository: jest.Mocked<ITransactionRepository>;

  beforeEach(async () => {
    const mockAccountRepository: jest.Mocked<IAccountRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByDocument: jest.fn(),
      findAllByUserId: jest.fn(),
    };
    const mockTransactionRepository: jest.Mocked<ITransactionRepository> = {
      deposit: jest.fn(),
      transfer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferUseCase,
        { provide: 'IAccountRepository', useValue: mockAccountRepository },
        {
          provide: 'ITransactionRepository',
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get(TransferUseCase);
    accountRepository = module.get('IAccountRepository');
    transactionRepository = module.get('ITransactionRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should transfer when payer is COMMON and has enough balance', async () => {
    const payer = Account.create({
      userId: 'user-1',
      document: '111',
      fullName: 'Payer',
      type: 'COMMON',
      balance: 1000,
    });
    accountRepository.findById.mockResolvedValue(payer);
    transactionRepository.transfer.mockResolvedValue(undefined);

    const result = await useCase.execute({
      payerId: payer.id,
      payeeId: 'payee-id',
      value: 300,
      idempotencyKey: 'key-123',
    });

    expect(result).toEqual({ message: 'Transferência concluída com sucesso!' });
    expect(transactionRepository.transfer).toHaveBeenCalledWith({
      senderId: payer.id,
      receiverId: 'payee-id',
      amount: 300,
      idempotencyKey: 'key-123',
    });
  });

  it('should throw BadRequestException when payer account not found', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        payerId: 'invalid-payer',
        payeeId: 'payee-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      useCase.execute({
        payerId: 'invalid-payer',
        payeeId: 'payee-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow('Conta pagadora não encontrada');

    expect(transactionRepository.transfer).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when payer is MERCHANT', async () => {
    const merchant = Account.create({
      userId: 'user-1',
      document: '111',
      fullName: 'Merchant',
      type: 'MERCHANT',
      balance: 5000,
    });
    accountRepository.findById.mockResolvedValue(merchant);

    await expect(
      useCase.execute({
        payerId: merchant.id,
        payeeId: 'payee-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      useCase.execute({
        payerId: merchant.id,
        payeeId: 'payee-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow('Contas PJ não podem realizar transferências');

    expect(transactionRepository.transfer).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when balance is insufficient', async () => {
    const payer = Account.create({
      userId: 'user-1',
      document: '111',
      fullName: 'Payer',
      type: 'COMMON',
      balance: 50,
    });
    accountRepository.findById.mockResolvedValue(payer);

    await expect(
      useCase.execute({
        payerId: payer.id,
        payeeId: 'payee-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      useCase.execute({
        payerId: payer.id,
        payeeId: 'payee-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow('Saldo insuficiente');

    expect(transactionRepository.transfer).not.toHaveBeenCalled();
  });
});
