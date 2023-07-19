import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList } from 'graphql';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: { type: ProfileType },
    posts: { type: new GraphQLList(PostType) },
  }),
});
