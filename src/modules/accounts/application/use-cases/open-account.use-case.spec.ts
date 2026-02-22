import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OpenAccountUseCase } from './open-account.use-case';
import { IAccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';

describe('OpenAccountUseCase', () => {
  let useCase: OpenAccountUseCase;
  let accountRepository: jest.Mocked<IAccountRepository>;

  beforeEach(async () => {
    const mockAccountRepository: jest.Mocked<IAccountRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByDocument: jest.fn(),
      findAllByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAccountUseCase,
        { provide: 'IAccountRepository', useValue: mockAccountRepository },
      ],
    }).compile();

    useCase = module.get(OpenAccountUseCase);
    accountRepository = module.get('IAccountRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should open an account when document is not in use', async () => {
    accountRepository.findByDocument.mockResolvedValue(null);
    accountRepository.create.mockResolvedValue(undefined);

    const input = {
      userId: 'user-123',
      document: '12345678900',
      fullName: 'João Silva',
      type: 'COMMON' as const,
    };

    const result = await useCase.execute(input);

    expect(result).toBeInstanceOf(Account);
    expect(result.userId).toBe(input.userId);
    expect(result.document).toBe(input.document);
    expect(result.fullName).toBe(input.fullName);
    expect(result.type).toBe(input.type);
    expect(result.balance).toBe(0);
    expect(accountRepository.findByDocument).toHaveBeenCalledWith(
      input.document,
    );
    expect(accountRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: input.userId,
        document: input.document,
        fullName: input.fullName,
        type: input.type,
      }),
    );
  });

  it('should open a MERCHANT account', async () => {
    accountRepository.findByDocument.mockResolvedValue(null);
    accountRepository.create.mockResolvedValue(undefined);

    const result = await useCase.execute({
      userId: 'user-123',
      document: '12345678000199',
      fullName: 'Empresa LTDA',
      type: 'MERCHANT',
    });

    expect(result.type).toBe('MERCHANT');
    expect(result.balance).toBe(0);
  });

  it('should throw BadRequestException when document is already linked', async () => {
    const existingAccount = Account.create({
      userId: 'other-user',
      document: '12345678900',
      fullName: 'Existing',
      type: 'COMMON',
    });
    accountRepository.findByDocument.mockResolvedValue(existingAccount);

    await expect(
      useCase.execute({
        userId: 'user-123',
        document: '12345678900',
        fullName: 'João',
        type: 'COMMON',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      useCase.execute({
        userId: 'user-123',
        document: '12345678900',
        fullName: 'João',
        type: 'COMMON',
      }),
    ).rejects.toThrow('Já existe uma conta vinculada a este documento.');

    expect(accountRepository.create).not.toHaveBeenCalled();
  });
});
