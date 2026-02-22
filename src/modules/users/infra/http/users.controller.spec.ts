import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { ListUserAccountsUseCase } from '../../application/use-cases/list-users-accounts.use-case';
import { User } from '../../domain/entities/user.entity';
import { Account } from '../../../accounts/domain/entities/account.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let listUserAccountsUseCase: jest.Mocked<ListUserAccountsUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ListUserAccountsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    createUserUseCase = module.get(CreateUserUseCase);
    listUserAccountsUseCase = module.get(ListUserAccountsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create user and return id and email', async () => {
      const user = User.create({
        email: 'user@example.com',
        passwordHash: 'hash:salt',
      });
      createUserUseCase.execute.mockResolvedValue(user);

      const body = { email: 'user@example.com', passwordRaw: 'secret123' };
      const result = await controller.create(body);

      expect(result).toEqual({ id: user.id, email: user.email });
      expect(createUserUseCase.execute).toHaveBeenCalledWith(body);
    });
  });

  describe('listUserAccounts', () => {
    it('should return list of accounts for user', async () => {
      const userId = 'user-123';
      const accounts = [
        Account.create({
          userId,
          document: '111',
          fullName: 'Account 1',
          type: 'COMMON',
          balance: 100,
        }),
      ];
      listUserAccountsUseCase.execute.mockResolvedValue(accounts);

      const result = await controller.listUserAccounts(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: accounts[0].id,
        fullName: accounts[0].fullName,
        document: accounts[0].document,
        type: accounts[0].type,
        balance: accounts[0].balance,
      });
      expect(listUserAccountsUseCase.execute).toHaveBeenCalledWith(userId);
    });
  });
});
