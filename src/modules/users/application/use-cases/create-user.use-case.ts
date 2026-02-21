import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User, UserType } from '../../domain/entities/user.entity';
import * as crypto from 'crypto';

export interface CreateUserDto {
  fullName: string;
  document: string;
  email: string;
  passwordRaw: string;
  type: UserType;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    // Sempre devemos injetar a Interface e não a classe do Prisma!
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: CreateUserDto): Promise<User> {
    const emailExists = await this.userRepository.findByEmail(data.email);
    if (emailExists) {
      throw new BadRequestException('Este e-mail já está em uso.');
    }

    const documentExists = await this.userRepository.findByDocument(
      data.document,
    );
    if (documentExists) {
      throw new BadRequestException('Este documento já está em uso.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash =
      crypto.scryptSync(data.passwordRaw, salt, 64).toString('hex') +
      ':' +
      salt;

    const user = User.create({
      fullName: data.fullName,
      document: data.document,
      email: data.email,
      passwordHash: passwordHash,
      type: data.type,
    });

    await this.userRepository.create(user);

    return user;
  }
}
