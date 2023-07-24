import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { ResolverContext, UserEntity } from '../ts-types.js';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profile.js';
import { PostType } from './post.js';

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: GraphQLString },
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
      resolve: (source: UserEntity, _args, { profileLoader }: ResolverContext) => {
        return profileLoader.load(source.id);
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: (source: UserEntity, _args, { postLoader }: ResolverContext) => {
        return postLoader.load(source.id);
      },
    },

    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (
        { subscribedToUser }: UserEntity,
        _args,
        { userLoader }: ResolverContext,
      ) => {
        if (!subscribedToUser) {
          return [];
        }

        const subscriberIds = subscribedToUser.map(({ subscriberId }) => subscriberId);
        return userLoader.loadMany(subscriberIds);
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (
        { userSubscribedTo }: UserEntity,
        _args,
        { userLoader }: ResolverContext,
      ) => {
        if (!userSubscribedTo) {
          return [];
        }

        const authorIds = userSubscribedTo.map(({ authorId }) => authorId);
        return userLoader.loadMany(authorIds);
      },
    },
  }),
});
