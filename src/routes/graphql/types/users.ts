import { GraphQLObjectType, GraphQLString, GraphQLFloat } from 'graphql';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profiles.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: { type: ProfileType },
  }),
});
