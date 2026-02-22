import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DepositUseCase } from './deposit.use-case';
import { IAccountRepository } from '../../../accounts/domain/repositories/account.repository';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Account } from '../../../../modules/accounts/domain/entities/account.entity';

describe('DepositUseCase', () => {
  let useCase: DepositUseCase;
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
        DepositUseCase,
        { provide: 'IAccountRepository', useValue: mockAccountRepository },
        {
          provide: 'ITransactionRepository',
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get(DepositUseCase);
    accountRepository = module.get('IAccountRepository');
    transactionRepository = module.get('ITransactionRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should perform deposit when account exists and value is positive', async () => {
    const account = Account.create({
      userId: 'user-1',
      document: '123',
      fullName: 'User',
      type: 'COMMON',
      balance: 1000,
    });
    accountRepository.findById.mockResolvedValue(account);
    transactionRepository.deposit.mockResolvedValue(undefined);

    const result = await useCase.execute({
      accountId: account.id,
      value: 500,
      idempotencyKey: 'key-123',
    });

    expect(result).toEqual({
      message: 'Depósito realizado com sucesso',
      newBalance: 1500,
    });
    expect(transactionRepository.deposit).toHaveBeenCalledWith({
      accountId: account.id,
      amount: 500,
      idempotencyKey: 'key-123',
    });
  });

  it('should throw BadRequestException when value is zero', async () => {
    const account = Account.create({
      userId: 'user-1',
      document: '123',
      fullName: 'User',
      type: 'COMMON',
      balance: 1000,
    });
    accountRepository.findById.mockResolvedValue(account);

    await expect(
      useCase.execute({
        accountId: account.id,
        value: 0,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      useCase.execute({
        accountId: account.id,
        value: 0,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow('O valor do depósito deve ser maior que zero');

    expect(transactionRepository.deposit).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when value is negative', async () => {
    const account = Account.create({
      userId: 'user-1',
      document: '123',
      fullName: 'User',
      type: 'COMMON',
      balance: 1000,
    });
    accountRepository.findById.mockResolvedValue(account);

    await expect(
      useCase.execute({
        accountId: account.id,
        value: -100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(transactionRepository.deposit).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when account does not exist', async () => {
    accountRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        accountId: 'non-existent-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow(NotFoundException);

    await expect(
      useCase.execute({
        accountId: 'non-existent-id',
        value: 100,
        idempotencyKey: 'key-123',
      }),
    ).rejects.toThrow('Conta não encontrada');

    expect(transactionRepository.deposit).not.toHaveBeenCalled();
  });
});
