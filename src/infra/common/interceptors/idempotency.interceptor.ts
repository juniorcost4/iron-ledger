import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, of, from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import * as crypto from 'crypto';
import { RedisService } from '../../redis/redis.service';

interface IdempotencyRecord {
  hash: string;
  response: unknown;
  status: 'processing' | 'completed';
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly redis: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();

    if (!['POST', 'PATCH', 'PUT'].includes(request.method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['x-idempotency-key'] as string;
    if (!idempotencyKey) return next.handle();

    const requestBody = JSON.stringify(request.body);
    const requestHash = crypto
      .createHash('sha256')
      .update(requestBody)
      .digest('hex');
    const redisKey = `idempotency:${idempotencyKey}`;

    const cachedData = await this.redis.get(redisKey);

    if (cachedData) {
      const { hash, response, status } = JSON.parse(
        cachedData,
      ) as IdempotencyRecord;

      if (hash !== requestHash) {
        throw new ConflictException(
          'Idempotency Key reuse with different payload',
        );
      }

      if (status === 'processing') {
        throw new ConflictException('Transaction is already being processed');
      }

      return of(response);
    }

    await this.redis.set(
      redisKey,
      JSON.stringify({ hash: requestHash, status: 'processing' }),
      'EX',
      60,
    );

    return next.handle().pipe(
      mergeMap((response: unknown) => {
        const record: IdempotencyRecord = {
          hash: requestHash,
          response,
          status: 'completed',
        };

        return from(
          this.redis.set(redisKey, JSON.stringify(record), 'EX', 86400),
        ).pipe(map(() => response));
      }),
    );
  }
}
