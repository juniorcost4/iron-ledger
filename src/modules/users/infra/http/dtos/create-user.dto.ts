import { UserType } from '../../../domain/entities/user.entity';

export class CreateUserDto {
  fullName!: string;
  document!: string;
  email!: string;
  passwordRaw!: string;
  type!: UserType;
}
