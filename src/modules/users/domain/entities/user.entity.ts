export type UserType = 'COMMON' | 'MERCHANT';

export class User {
  // Propriedades privadas/readonly protegem o estado da entidade
  private constructor(
    public readonly id: string,
    public fullName: string,
    public document: string, // CPF ou CNPJ
    public email: string,
    public passwordHash: string,
    public type: UserType,
  ) {}

  static create(
    props: {
      fullName: string;
      document: string;
      email: string;
      passwordHash: string;
      type: UserType;
    },
    id?: string,
  ): User {
    const userId = id ?? crypto.randomUUID();

    return new User(
      userId,
      props.fullName,
      props.document,
      props.email,
      props.passwordHash,
      props.type,
    );
  }

  // Clean Architecture: A regra de negócio mora na própria entidade, não em um "Service" gigante.

  canSendMoney(): boolean {
    return this.type === 'COMMON';
  }

  isMerchant(): boolean {
    return this.type === 'MERCHANT';
  }
}
