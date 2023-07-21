import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { HttpErrors } from '@fastify/sensible/lib/httpError.js';
import DataLoader from 'dataloader';

export interface ResolverContext {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  httpErrors: HttpErrors;
  memberTypeLoader: DataLoader<string, MemberTypeType, string>;
  postLoader: DataLoader<string, Post[], string>;
  profileLoader: DataLoader<string, Profile, string>;
  subscribersLoader: DataLoader<string, User[], string>;
  subscriptionsLoader: DataLoader<string, User[], string>;
}

export type MemberTypeType = {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
};

export type Post = {
  id: string;
  title: string;
  content: string;
};

export type Profile = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
};

export type User = {
  id: string;
  name: string;
  balance: number;
};
