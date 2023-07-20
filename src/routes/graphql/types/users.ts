import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { ResolverContext } from '../ts-types.js';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';

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

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
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
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) =>
        prisma.profile.findUnique({ where: { userId: source.id } }),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) =>
        prisma.post.findMany({ where: { authorId: source.id } }),
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) =>
        prisma.user.findMany({
          where: { userSubscribedTo: { some: { authorId: source.id } } },
        }),
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) => {
        return prisma.user.findMany({
          where: { subscribedToUser: { some: { subscriberId: source.id } } },
        });
      },
    },
  }),
});
