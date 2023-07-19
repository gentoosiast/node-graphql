import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';

interface Context {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
}

interface SourceProps {
  id: string;
}

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: UUIDType },
    balance: { type: GraphQLFloat },
  }),
});

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      resolve: (source: SourceProps, _args, { prisma }: Context) =>
        prisma.profile.findUnique({ where: { userId: source.id } }),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (source: SourceProps, _args, { prisma }: Context) =>
        prisma.post.findMany({ where: { authorId: source.id } }),
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { prisma }: Context) =>
        prisma.user.findMany({
          where: { userSubscribedTo: { some: { authorId: source.id } } },
        }),
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { prisma }: Context) =>
        prisma.user.findMany({
          where: { subscribedToUser: { some: { subscriberId: source.id } } },
        }),
    },
  }),
});
