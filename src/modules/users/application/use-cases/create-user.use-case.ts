import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import * as crypto from 'crypto';

export interface CreateUserDto {
  email: string;
  passwordRaw: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(data: { email: string; passwordRaw: string }): Promise<User> {
    const emailExists = await this.userRepository.findByEmail(data.email);
    if (emailExists) {
      throw new BadRequestException('Este e-mail já está em uso.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash =
      crypto.scryptSync(data.passwordRaw, salt, 64).toString('hex') +
      ':' +
      salt;

    const user = User.create({
      email: data.email,
      passwordHash: passwordHash,
    });

    await this.userRepository.create(user);
    return user;
  }
}
