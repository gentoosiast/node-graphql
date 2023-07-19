import { GraphQLObjectType, GraphQLBoolean, GraphQLInt } from 'graphql';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library.js';
import { MemberType } from './member-types.js';
import { MemberTypeId } from '../../member-types/schemas.js';
import { UUIDType } from './uuid.js';

interface Context {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
}

interface SourceProps {
  memberTypeId: MemberTypeId;
}

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberType: {
      type: MemberType,
      resolve: (source: SourceProps, _args, { prisma }: Context) =>
        prisma.memberType.findUnique({ where: { id: source.memberTypeId } }),
    },
  }),
});
