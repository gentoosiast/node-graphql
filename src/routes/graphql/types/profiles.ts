import {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';
import DataLoader from 'dataloader';
import { ResolverContext } from '../ts-types.js';
import { MemberType, MemberTypeId } from './member-types.js';
import { MemberTypeId as MemberTypeIdType } from '../../member-types/schemas.js';
import { UUIDType } from './uuid.js';
import { PrismaClient } from '@prisma/client';

interface SourceProps {
  memberTypeId: MemberTypeIdType;
}

type MemberTypeType = {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
};

async function batchLoadMemberTypes(
  memberTypeIds: string[],
  prisma: PrismaClient,
): Promise<MemberTypeType[]> {
  const memberTypes = await prisma.memberType.findMany({
    where: { id: { in: memberTypeIds } },
  });

  const memberTypeMap: { [id: string]: MemberTypeType } = {};
  memberTypes.forEach((memberType) => {
    memberTypeMap[memberType.id] = memberType;
  });

  return memberTypeIds.map((id) => memberTypeMap[id]);
}

let memberTypeLoader: DataLoader<string, MemberTypeType>;

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
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) => {
        if (!memberTypeLoader) {
          memberTypeLoader = new DataLoader<string, MemberTypeType>(
            async (memberTypeIds) => batchLoadMemberTypes([...memberTypeIds], prisma),
          );
        }

        return memberTypeLoader.load(source.memberTypeId);
      },
    },
  }),
});
