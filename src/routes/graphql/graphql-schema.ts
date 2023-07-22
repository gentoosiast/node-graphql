import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { PrismaQueryUsersIncludeArgs, ResolverContext, User } from './ts-types.js';
import { MemberType, MemberTypeId } from './types/member-type.js';
import { MemberTypeId as MemberTypeIdType } from '../member-types/schemas.js';
import { ChangePostInput, CreatePostInput, PostType } from './types/post.js';
import { ChangeProfileInput, CreateProfileInput, ProfileType } from './types/profile.js';
import { ChangeUserInput, CreateUserInput, UserType } from './types/user.js';
import { UUIDType } from './types/uuid.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      memberTypes: {
        type: new GraphQLList(MemberType),
        resolve(_source, _args, { prisma }: ResolverContext) {
          return prisma.memberType.findMany();
        },
      },

      posts: {
        type: new GraphQLList(PostType),
        resolve(_source, _args, { prisma }: ResolverContext) {
          return prisma.post.findMany();
        },
      },

      users: {
        type: new GraphQLList(UserType),
        resolve: async (
          _source,
          _args,
          { prisma, userLoader }: ResolverContext,
          resolveInfo,
        ) => {
          const parsedResolveInfoFragment = parseResolveInfo(resolveInfo);
          const fields = parsedResolveInfoFragment?.fieldsByTypeName.User;
          const includeArgs: PrismaQueryUsersIncludeArgs = {};

          if (fields && 'userSubscribedTo' in fields) {
            includeArgs.userSubscribedTo = true;
          }

          if (fields && 'subscribedToUser' in fields) {
            includeArgs.subscribedToUser = true;
          }

          const users = await prisma.user.findMany({ include: includeArgs });

          const idsToPrime = new Set<string>();
          const userMap = new Map<string, User>();
          users.forEach((user) => {
            userMap.set(user.id, user);
            if (includeArgs.userSubscribedTo) {
              user.userSubscribedTo?.forEach(({ authorId }) => {
                idsToPrime.add(authorId);
              });
            }

            if (includeArgs.subscribedToUser) {
              user.subscribedToUser?.forEach(({ subscriberId }) => {
                idsToPrime.add(subscriberId);
              });
            }
          });

          idsToPrime.forEach((id) => {
            const user = userMap.get(id);
            if (user) {
              userLoader.prime(id, user);
            }
          });

          return users;
        },
      },

      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: (_source, _args, { prisma }: ResolverContext) => {
          return prisma.profile.findMany();
        },
      },

      memberType: {
        type: MemberType,
        args: {
          id: {
            type: new GraphQLNonNull(MemberTypeId),
          },
        },
        resolve: (_source, { id }: { id: string }, { prisma }: ResolverContext) => {
          return prisma.memberType.findUnique({ where: { id } });
        },
      },

      post: {
        type: PostType,
        args: {
          id: {
            type: new GraphQLNonNull(UUIDType),
          },
        },
        resolve: (_source, { id }: { id: string }, { prisma }: ResolverContext) => {
          return prisma.post.findUnique({ where: { id } });
        },
      },

      user: {
        type: UserType,
        args: {
          id: {
            type: new GraphQLNonNull(UUIDType),
          },
        },
        resolve: (_source, { id }: { id: string }, { userLoader }: ResolverContext) => {
          return userLoader.load(id);
        },
      },

      profile: {
        type: ProfileType,
        args: {
          id: {
            type: new GraphQLNonNull(UUIDType),
          },
        },
        resolve: (_source, { id }: { id: string }, { prisma }: ResolverContext) => {
          return prisma.profile.findUnique({
            where: { id },
          });
        },
      },
    },
  }),

  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createUser: {
        type: UserType,
        args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
        resolve: (
          _source,
          { dto }: { dto: { name: string; balance: number } },
          { prisma }: ResolverContext,
        ) => {
          return prisma.user.create({ data: dto });
        },
      },

      createPost: {
        type: PostType,
        args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
        resolve: (
          _source,
          { dto }: { dto: { authorId: string; title: string; content: string } },
          { prisma }: ResolverContext,
        ) => {
          return prisma.post.create({ data: dto });
        },
      },

      createProfile: {
        type: ProfileType,
        args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
        resolve: (
          _source,
          {
            dto,
          }: {
            dto: {
              userId: string;
              memberTypeId: MemberTypeIdType;
              isMale: boolean;
              yearOfBirth: number;
            };
          },
          { prisma }: ResolverContext,
        ) => {
          return prisma.profile.create({ data: dto });
        },
      },

      deleteUser: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (
          _source,
          { id }: { id: string },
          { prisma, userLoader }: ResolverContext,
        ) => {
          userLoader.clear(id);
          await prisma.user.delete({ where: { id } });

          return null;
        },
      },

      deletePost: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_source, { id }: { id: string }, { prisma }: ResolverContext) => {
          await prisma.post.delete({ where: { id } });

          return null;
        },
      },

      deleteProfile: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_source, { id }: { id: string }, { prisma }: ResolverContext) => {
          await prisma.profile.delete({ where: { id } });

          return null;
        },
      },

      changeUser: {
        type: UserType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeUserInput) },
        },
        resolve(
          _source,
          { id, dto }: { id: string; dto: { name: string; balance: number } },
          { prisma, userLoader }: ResolverContext,
        ) {
          userLoader.clear(id);
          return prisma.user.update({ where: { id }, data: dto });
        },
      },

      changePost: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInput) },
        },
        resolve(
          _source,
          { id, dto }: { id: string; dto: { title: string; content: string } },
          { prisma }: ResolverContext,
        ) {
          return prisma.post.update({ where: { id }, data: dto });
        },
      },

      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInput) },
        },
        resolve(
          _source,
          {
            id,
            dto,
          }: {
            id: string;
            dto: {
              isMale: boolean;
              yearOfBirth: number;
              memberTypeId: MemberTypeIdType;
            };
          },
          { prisma }: ResolverContext,
        ) {
          return prisma.profile.update({ where: { id }, data: dto });
        },
      },

      subscribeTo: {
        type: UserType,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve(
          _source,
          { userId, authorId }: { userId: string; authorId: string },
          { prisma, userLoader }: ResolverContext,
        ) {
          userLoader.clear(userId);
          return prisma.user.update({
            where: { id: userId },
            data: { userSubscribedTo: { create: { authorId } } },
          });
        },
      },

      unsubscribeFrom: {
        type: GraphQLString,
        args: {
          userId: { type: new GraphQLNonNull(UUIDType) },
          authorId: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (
          _source,
          { userId, authorId }: { userId: string; authorId: string },
          { prisma, userLoader }: ResolverContext,
        ) => {
          userLoader.clear(userId);
          await prisma.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: userId,
                authorId,
              },
            },
          });

          return null;
        },
      },
    },
  }),
});
