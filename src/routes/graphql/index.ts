import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { MemberType, MemberTypeId } from './types/member-types.js';
import { MemberTypeId as MemberTypeIdType } from '../member-types/schemas.js';
import { CreatePostInput, PostType } from './types/posts.js';
import { UserType, CreateUserInput } from './types/users.js';
import { CreateProfileInput, ProfileType } from './types/profiles.js';
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
          resolve: (_source, { id }: { id: string }, _context) => {
            return prisma.user.findUnique({
              where: { id },
            });
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
            return prisma.profile.findUnique({
              where: { id },
            });
          },
        },
      },
    }),

    mutation: new GraphQLObjectType({
      name: 'RootMutationType',
      fields: {
        createUser: {
          type: UserType,
          args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
          resolve: (
            _source,
            { dto }: { dto: { name: string; balance: number } },
            _context,
          ) => {
            return prisma.user.create({ data: dto });
          },
        },

        createPost: {
          type: PostType,
          args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
          resolve: (
            _source,
            { dto }: { dto: { authorId: string; title: string; content: string } },
            _context,
          ) => {
            return prisma.post.create({ data: dto });
          },
        },

        createProfile: {
          type: ProfileType,
          args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
          resolve: (
            _source,
            {
              dto,
            }: {
              dto: {
                userId: string;
                memberTypeId: MemberTypeIdType;
                isMale: boolean;
                yearOfBirth: number;
              };
            },
            _context,
          ) => {
            return prisma.profile.create({ data: dto });
          },
        },

        deleteUser: {
          type: GraphQLString,
          args: { id: { type: new GraphQLNonNull(UUIDType) } },
          resolve: async (_source, { id }: { id: string }, _context) => {
            await prisma.user.delete({ where: { id } });

            return null;
          },
        },

        deletePost: {
          type: GraphQLString,
          args: { id: { type: new GraphQLNonNull(UUIDType) } },
          resolve: async (_source, { id }: { id: string }, _context) => {
            await prisma.post.delete({ where: { id } });

            return null;
          },
        },

        deleteProfile: {
          type: GraphQLString,
          args: { id: { type: new GraphQLNonNull(UUIDType) } },
          resolve: async (_source, { id }: { id: string }, _context) => {
            await prisma.profile.delete({ where: { id } });

            return null;
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
        contextValue: {
          prisma,
        },
        source: req.body.query,
        variableValues: req.body.variables,
      });

      return result;
    },
  });
};

export default plugin;
