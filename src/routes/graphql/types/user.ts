import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { ResolverContext } from '../ts-types.js';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profile.js';
import { PostType } from './post.js';

interface SourceProps {
  id: string;
}

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
      resolve: (source: SourceProps, _args, { profileLoader }: ResolverContext) => {
        return profileLoader.load(source.id);
      },
    },

    posts: {
      type: new GraphQLList(PostType),
      resolve: (source: SourceProps, _args, { postLoader }: ResolverContext) => {
        return postLoader.load(source.id);
      },
    },

    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { subscribersLoader }: ResolverContext) => {
        return subscribersLoader.load(source.id);
      },
    },

    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { subscriptionsLoader }: ResolverContext) => {
        return subscriptionsLoader.load(source.id);
      },
    },
  }),
});
