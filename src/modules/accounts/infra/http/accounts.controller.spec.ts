import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { OpenAccountUseCase } from '../../application/use-cases/open-account.use-case';
import { Account } from '../../domain/entities/account.entity';

describe('AccountsController', () => {
  let controller: AccountsController;
  let openAccountUseCase: jest.Mocked<OpenAccountUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        {
          provide: OpenAccountUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AccountsController);
    openAccountUseCase = module.get(OpenAccountUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('open', () => {
    it('should open account and return account data', async () => {
      const account = Account.create({
        userId: 'user-123',
        document: '12345678900',
        fullName: 'João Silva',
        type: 'COMMON',
        balance: 0,
      });
      openAccountUseCase.execute.mockResolvedValue(account);

      const body = {
        userId: 'user-123',
        document: '12345678900',
        fullName: 'João Silva',
        type: 'COMMON' as const,
      };
      const result = await controller.open(body);

      expect(result).toEqual({
        id: account.id,
        userId: account.userId,
        document: account.document,
        fullName: account.fullName,
        type: account.type,
        balance: account.balance,
      });
      expect(openAccountUseCase.execute).toHaveBeenCalledWith(body);
    });
  });
});
