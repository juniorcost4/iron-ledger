import { Test, TestingModule } from '@nestjs/testing';
import { ListUserAccountsUseCase } from './list-users-accounts.use-case';
import { IAccountRepository } from '../../../../modules/accounts/domain/repositories/account.repository';
import { Account } from '../../../../modules/accounts/domain/entities/account.entity';

describe('ListUserAccountsUseCase', () => {
  let useCase: ListUserAccountsUseCase;
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
        ListUserAccountsUseCase,
        { provide: 'IAccountRepository', useValue: mockAccountRepository },
      ],
    }).compile();

    useCase = module.get(ListUserAccountsUseCase);
    accountRepository = module.get('IAccountRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return accounts for the given user id', async () => {
    const userId = 'user-123';
    const accounts = [
      Account.create({
        userId,
        document: '111',
        fullName: 'User One',
        type: 'COMMON',
        balance: 100,
      }),
      Account.create({
        userId,
        document: '222',
        fullName: 'User Two',
        type: 'MERCHANT',
        balance: 0,
      }),
    ];
    accountRepository.findAllByUserId.mockResolvedValue(accounts);

    const result = await useCase.execute(userId);

    expect(result).toHaveLength(2);
    expect(result).toEqual(accounts);
    expect(accountRepository.findAllByUserId).toHaveBeenCalledWith(userId);
  });

  it('should return empty array when user has no accounts', async () => {
    accountRepository.findAllByUserId.mockResolvedValue([]);

    const result = await useCase.execute('user-no-accounts');

    expect(result).toEqual([]);
    expect(accountRepository.findAllByUserId).toHaveBeenCalledWith(
      'user-no-accounts',
    );
  });
});
