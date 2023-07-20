import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { HttpErrors } from '@fastify/sensible/lib/httpError.js';

export interface ResolverContext {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  httpErrors: HttpErrors;
}
