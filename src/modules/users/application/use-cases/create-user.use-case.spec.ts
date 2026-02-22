import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserRepository: jest.Mocked<IUserRepository> = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: 'IUserRepository', useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get(CreateUserUseCase);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a user when email is not in use', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(undefined);

    const result = await useCase.execute({
      email: 'user@example.com',
      passwordRaw: 'password123',
    });

    expect(result).toBeInstanceOf(User);
    expect(result.email).toBe('user@example.com');
    expect(result.passwordHash).toBeDefined();
    expect(result.id).toBeDefined();
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@example.com' }),
    );
  });

  it('should throw BadRequestException when email is already in use', async () => {
    const existingUser = User.create({
      email: 'user@example.com',
      passwordHash: 'hash:salt',
    });
    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        passwordRaw: 'password123',
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      useCase.execute({
        email: 'user@example.com',
        passwordRaw: 'password123',
      }),
    ).rejects.toThrow('Este e-mail já está em uso.');

    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
