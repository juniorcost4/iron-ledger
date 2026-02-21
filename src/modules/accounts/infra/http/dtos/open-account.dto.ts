import { AccountType } from '../../../domain/entities/account.entity';

export class OpenAccountDto {
  userId!: string;
  document!: string;
  fullName!: string;
  type!: AccountType;
}
