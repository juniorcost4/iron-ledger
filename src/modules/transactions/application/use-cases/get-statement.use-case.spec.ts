import { Test, TestingModule } from '@nestjs/testing';
import { GetStatementUseCase } from './get-statement.use-case';
import { ILedgerRepository } from '../../domain/repositories/ledger.repository';
import { LedgerEntry } from '../../domain/entities/ledger-entry.entity';

describe('GetStatementUseCase', () => {
  let useCase: GetStatementUseCase;
  let ledgerRepository: jest.Mocked<ILedgerRepository>;

  beforeEach(async () => {
    const mockLedgerRepository: jest.Mocked<ILedgerRepository> = {
      findAllByAccountId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStatementUseCase,
        { provide: 'ILedgerRepository', useValue: mockLedgerRepository },
      ],
    }).compile();

    useCase = module.get(GetStatementUseCase);
    ledgerRepository = module.get('ILedgerRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return ledger entries for the given account', async () => {
    const accountId = 'account-123';
    const entries = [
      new LedgerEntry(
        'id-1',
        accountId,
        -100,
        'DEBIT',
        'Transferência',
        new Date(),
      ),
      new LedgerEntry('id-2', accountId, 50, 'CREDIT', 'Depósito', new Date()),
    ];
    ledgerRepository.findAllByAccountId.mockResolvedValue(entries);

    const result = await useCase.execute(accountId);

    expect(result).toEqual(entries);
    expect(ledgerRepository.findAllByAccountId).toHaveBeenCalledWith(accountId);
  });

  it('should return empty array when account has no entries', async () => {
    ledgerRepository.findAllByAccountId.mockResolvedValue([]);

    const result = await useCase.execute('account-empty');

    expect(result).toEqual([]);
    expect(ledgerRepository.findAllByAccountId).toHaveBeenCalledWith(
      'account-empty',
    );
  });
});
