import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';
import { ResolverContext } from '../ts-types.js';
import { MemberType, MemberTypeId } from './member-types.js';
import { MemberTypeId as MemberTypeIdType } from '../../member-types/schemas.js';
import { UUIDType } from './uuid.js';

interface SourceProps {
  memberTypeId: MemberTypeIdType;
}

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeId },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    MemberTypeId: { type: MemberTypeId },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: {
      type: MemberType,
      resolve: (source: SourceProps, _args, { memberTypeLoader }: ResolverContext) => {
        return memberTypeLoader.load(source.memberTypeId);
      },
    },
  }),
});
