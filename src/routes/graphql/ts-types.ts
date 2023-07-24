import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { HttpErrors } from '@fastify/sensible/lib/httpError.js';
import DataLoader from 'dataloader';

export interface ResolverContext {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
  httpErrors: HttpErrors;
  memberTypeLoader: DataLoader<string, MemberTypeEntity, string>;
  postLoader: DataLoader<string, PostEntity[], string>;
  profileLoader: DataLoader<string, ProfileEntity, string>;
  userLoader: DataLoader<string, UserEntity, string>;
}

export type MemberTypeEntity = {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
};

export type PostEntity = {
  id: string;
  title: string;
  content: string;
  authorId: string;
};

export type ProfileEntity = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
};

type SubscribedToUser = {
  subscriberId: string;
};

type UserSubscribedTo = {
  authorId: string;
};

export type UserEntity = {
  id: string;
  name: string;
  balance: number;
  subscribedToUser?: SubscribedToUser[];
  userSubscribedTo?: UserSubscribedTo[];
};

export type PrismaQueryUsersIncludeArgs = {
  userSubscribedTo?: true;
  subscribedToUser?: true;
};

export type CreateUserDto = Pick<UserEntity, 'name' | 'balance'>;
export type CreatePostDto = Omit<PostEntity, 'id'>;
export type CreateProfileDto = Omit<ProfileEntity, 'id'>;
export type ChangeUserDto = Partial<CreateUserDto>;
export type ChangePostDto = Partial<Pick<PostEntity, 'title' | 'content'>>;
export type ChangeProfileDto = Partial<
  Pick<ProfileEntity, 'isMale' | 'yearOfBirth' | 'memberTypeId'>
>;
export type SubscribeDto = { userId: string } & UserSubscribedTo;
