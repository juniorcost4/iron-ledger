# Iron Ledger

API de ledger financeiro para transações: cadastro de usuários, abertura de contas, depósitos, transferências e extratos. Desenvolvida com **NestJS**, **Prisma**, **PostgreSQL** e **Redis**.

---

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado:

| Requisito    | Versão / Observação |
|-------------|----------------------|
| **Node.js** | >= 24 (recomendado usar o `.nvmrc`: `nvm use`) |
| **pnpm**    | Gerenciador de pacotes do projeto |
| **PostgreSQL** | 15+ (pode usar via Docker) |
| **Redis**   | 7+ (usado para idempotência em depósito/transferência; pode usar via Docker) |
| **Docker**  | Opcional, para subir PostgreSQL e Redis com `docker-compose` |

---

## Como executar

### 1. Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd iron-ledger
pnpm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

Exemplo de `.env`:

```env
PORT=8000
DATABASE_URL="postgresql://root:rootpassword@localhost:5432/ironledger?schema=public"

# Opcional (padrão: localhost:6379)
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

### 3. Subir PostgreSQL e Redis (Docker)

Se não tiver PostgreSQL e Redis rodando localmente:

```bash
docker-compose up -d
```

Isso sobe:

- **PostgreSQL** em `localhost:5432` (usuário: `root`, senha: `rootpassword`, banco: `ironledger`)
- **Redis** em `localhost:6379`

### 4. Rodar as migrações

```bash
pnpm prisma migrate deploy
```

Para desenvolvimento, se precisar aplicar migrações pendentes:

```bash
pnpm prisma migrate dev
```

### 5. Iniciar a aplicação

```bash
# Desenvolvimento (watch)
pnpm start:dev

# Produção (build + run)
pnpm build
pnpm start:prod
```

A API estará em **http://localhost:8000** (ou na porta definida em `PORT`).

### 6. Documentação da API (Swagger)

Com a aplicação rodando, acesse:

- **http://localhost:8000/api/docs**

---

## Estrutura do projeto

O projeto segue uma organização por **módulos** e camadas (inspirada em Clean Architecture):

```
src/
├── main.ts                 # Bootstrap da aplicação (Fastify + Swagger)
├── app.module.ts           # Módulo raiz
│
├── infra/                  # Infraestrutura compartilhada
│   ├── database/prisma/    # Prisma (PostgreSQL)
│   ├── redis/              # Cliente Redis (idempotência)
│   └── common/interceptors # Ex.: IdempotencyInterceptor
│
└── modules/
    ├── users/              # Usuários
    │   ├── domain/         # Entidades e contratos (repositórios)
    │   ├── application/    # Use cases (create-user, list-users-accounts)
    │   └── infra/          # HTTP (controllers, DTOs), DB (Prisma)
    │
    ├── accounts/           # Contas
    │   ├── domain/
    │   ├── application/    # open-account
    │   └── infra/
    │
    └── transactions/      # Transações
        ├── domain/
        ├── application/    # deposit, transfer, get-statement
        └── infra/
```

Cada módulo contém:

- **domain**: entidades e interfaces de repositório.
- **application**: casos de uso (regras de negócio).
- **infra**: implementações (HTTP com Nest, repositórios Prisma).

---

## Como o projeto funciona

### Fluxo geral

1. **Usuários** – Cadastro com e-mail e senha (`POST /users`).
2. **Contas** – Um usuário pode ter várias contas (`POST /accounts`). Cada conta tem documento (CPF/CNPJ), nome e tipo (COMMON ou MERCHANT).
3. **Transações** – Operações financeiras:
   - **Depósito** – Credita valor em uma conta (`POST /transactions/deposit`).
   - **Transferência** – Debita de uma conta e credita em outra (`POST /transactions/transfer`).
   - **Extrato** – Lista movimentações de uma conta (`GET /transactions/statement/:accountId`).

Depósitos e transferências usam o header **`x-idempotency-key`** para evitar processar a mesma operação duas vezes; o estado de idempotência fica no **Redis**.

### Valores

Os valores são armazenados em **centavos** (inteiros) para evitar problemas de arredondamento.

---

## Relação das tabelas (banco de dados)

O modelo é definido em `prisma/schema.prisma`. Resumo das entidades e relacionamentos:

```
┌─────────────┐       ┌─────────────┐
│    User     │       │  Account    │
├─────────────┤       ├─────────────┤
│ id (PK)     │──1:N──│ id (PK)     │
│ email       │       │ userId (FK) │
│ password    │       │ document    │
│ createdAt   │       │ fullName    │
└─────────────┘       │ type        │
                      │ balance     │
                      │ createdAt   │
                      │ updatedAt   │
                      └──────┬──────┘
                             │
                             │ 1:N
                             ▼
                      ┌─────────────┐       ┌─────────────────┐
                      │ LedgerEntry │       │  Transaction    │
                      ├─────────────┤       ├─────────────────┤
                      │ id (PK)     │   N:1 │ id (PK)         │
                      │ accountId   │───────│ idempotencyKey  │
                      │ transactionId│──────│ amount          │
                      │ amount      │       │ status          │
                      │ operation   │       │ createdAt       │
                      │ createdAt   │       │ updatedAt       │
                      └─────────────┘       └─────────────────┘
```

- **User** → **Account**: um usuário pode ter várias contas (`userId` em `Account`).
- **Account** → **LedgerEntry**: cada movimento (débito/crédito) é uma entrada no ledger vinculada a uma conta.
- **Transaction** → **LedgerEntry**: uma transação (depósito ou transferência) gera uma ou mais entradas (ex.: uma transferência gera débito em uma conta e crédito em outra).
- **Account.balance**: saldo atual; as entradas em **LedgerEntry** são o histórico (extrato).

### Enums

- **AccountType**: `COMMON` (pessoa física), `MERCHANT` (pessoa jurídica).
- **TransactionStatus**: `PENDING`, `COMPLETED`, `FAILED`.
- **OperationType**: `DEBIT`, `CREDIT`.

---

## Scripts úteis

| Comando          | Descrição                    |
|------------------|------------------------------|
| `pnpm start:dev` | Desenvolvimento com watch    |
| `pnpm build`     | Build de produção            |
| `pnpm start:prod`| Roda o build em produção     |
| `pnpm test`      | Testes unitários             |
| `pnpm test:cov`  | Testes com cobertura         |
| `pnpm lint`      | ESLint                       |
| `pnpm format`    | Prettier nos arquivos        |
| `pnpm prisma migrate deploy` | Aplica migrações (produção) |
| `pnpm prisma migrate dev`    | Migrações em desenvolvimento |

---

## Licença

Apache 2.0
