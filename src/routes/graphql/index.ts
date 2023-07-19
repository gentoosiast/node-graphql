import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { MemberType, MemberTypeId } from './types/member-types.js';
import { PostType } from './types/posts.js';
import { UserType } from './types/users.js';
import { ProfileType } from './types/profiles.js';
import { UUIDType } from './types/uuid.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: {
        memberTypes: {
          type: new GraphQLList(MemberType),
          resolve() {
            return prisma.memberType.findMany();
          },
        },
        posts: {
          type: new GraphQLList(PostType),
          resolve() {
            return prisma.post.findMany();
          },
        },
        users: {
          type: new GraphQLList(UserType),
          resolve: () => {
            return prisma.user.findMany();
          },
        },
        profiles: {
          type: new GraphQLList(ProfileType),
          resolve: () => {
            return prisma.profile.findMany();
          },
        },
        memberType: {
          type: MemberType,
          args: {
            id: {
              type: new GraphQLNonNull(MemberTypeId),
            },
          },
          resolve: (_source, { id }: { id: string }) => {
            return prisma.memberType.findUnique({ where: { id } });
          },
        },
        post: {
          type: PostType,
          args: {
            id: {
              type: new GraphQLNonNull(UUIDType),
            },
          },
          resolve: (_source, { id }: { id: string }) => {
            return prisma.post.findUnique({ where: { id } });
          },
        },
        user: {
          type: UserType,
          args: {
            id: {
              type: new GraphQLNonNull(UUIDType),
            },
          },
          resolve: (_source, { id }: { id: string }) => {
            return prisma.user.findUnique({ where: { id } });
          },
        },
        profile: {
          type: ProfileType,
          args: {
            id: {
              type: new GraphQLNonNull(UUIDType),
            },
          },
          resolve: (_source, { id }: { id: string }) => {
            return prisma.profile.findUnique({ where: { id } });
          },
        },
      },
    }),
  });

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const result = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
      });

      return result;
    },
  });
};

export default plugin;
