import { GraphQLObjectType, GraphQLBoolean, GraphQLInt } from 'graphql';
import { UUIDType } from './uuid.js';
import { MemberType } from './member-types.js';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: { type: MemberType },
  }),
});
