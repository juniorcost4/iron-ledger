export class User {
  private constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
  ) {}

  static create(
    props: {
      email: string;
      passwordHash: string;
    },
    id?: string,
  ): User {
    const userId = id ?? crypto.randomUUID();
    return new User(userId, props.email, props.passwordHash);
  }
}
